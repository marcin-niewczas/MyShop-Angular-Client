import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Subject,
  filter,
  first,
  interval,
  map,
  merge,
  switchMap,
  takeWhile,
} from 'rxjs';
import { OrderWithProducts } from '../../../shared/models/order/order-with-products.interface';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { OrderStatusHistoryTimelineComponent } from '../../../shared/components/order-status-history-timeline/order-status-history-timeline.component';
import { PhotoComponent } from '../../../shared/components/photo/photo.component';
import { getOrderStatusColorClass } from '../../../shared/functions/order-status-functions';
import { NotificationType } from '../../../shared/models/responses/notification/notification-type.enum';
import { OrderStatus } from '../../../shared/models/responses/order/order-status.enum';
import { UserRole } from '../../../shared/models/responses/user/user-role.enum';
import { NotificationHubService } from '../../../shared/services/hubs/notification-hub.service';
import { AuthService } from '../../authenticate/auth.service';
import {
  ECommerceRouteService,
  ECommerceRouteSection,
} from '../services/ecommerce-route.service';
import { OrderEcService } from '../services/order-ec.service';

@Component({
  selector: 'app-ec-order-summary',
  standalone: true,
  imports: [
    RouterModule,
    LoadingComponent,
    PhotoComponent,
    CurrencyPipe,
    MatDividerModule,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    NgClass,
    OrderStatusHistoryTimelineComponent,
  ],
  templateUrl: './ec-order-summary.component.html',
  styleUrl: './ec-order-summary.component.scss',
})
export class EcOrderSummaryComponent implements OnInit, OnDestroy {
  private readonly _notificationHubService = inject(NotificationHubService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _eCommerceRouteService = inject(ECommerceRouteService);
  private readonly _orderEcService = inject(OrderEcService);
  private readonly _authService = inject(AuthService);

  private readonly _refreshOrder = new Subject<string>();

  private readonly _refreshOrderStatusForGuestSubject = new BehaviorSubject<
    { orderStatus: OrderStatus; orderId: string } | undefined
  >(undefined);

  private readonly _orderNotficationCatcher = toSignal(
    this._authService.hasCustomerPermission()
      ? this._notificationHubService.notification$.pipe(
          filter(
            (notification) =>
              notification.notificationType === NotificationType.Order &&
              this.order()?.id === notification.resourceId,
          ),
          map((notification) => {
            if (
              notification.message.startsWith(
                'The Order status has been changed to ',
              )
            ) {
              this._refreshOrder.next(this.order()?.id!);
            }
          }),
        )
      : this._refreshOrderStatusForGuestSubject.pipe(
          filter(
            (
              orderStatus,
            ): orderStatus is { orderStatus: OrderStatus; orderId: string } =>
              orderStatus != undefined &&
              orderStatus.orderStatus === OrderStatus.WaitingForPayment,
          ),
          first(),
          switchMap((value) =>
            interval(30_000).pipe(
              takeWhile(
                () => this.order()?.status! === OrderStatus.WaitingForPayment,
              ),
              switchMap(() =>
                this._orderEcService.getOrderStatus(value.orderId).pipe(
                  map((response) => {
                    const order = this.order();

                    if (order && order.status !== response.data.status) {
                      this._refreshOrder.next(order.id);
                      order.status = response.data.status;
                    }
                  }),
                ),
              ),
            ),
          ),
        ),
  );

  readonly order = toSignal(
    merge(
      this._activatedRoute.data.pipe(
        map(({ order }) => {
          const data = order as OrderWithProducts;

          if (this._authService.currentUser()?.userRole === UserRole.Guest) {
            this._refreshOrderStatusForGuestSubject.next({
              orderId: data.id,
              orderStatus: data.status,
            });
          }

          return data;
        }),
      ),
      this._refreshOrder.pipe(
        switchMap((id) =>
          this._orderEcService.get(id).pipe(map((response) => response.data)),
        ),
      ),
    ),
  );

  ngOnInit(): void {
    this._eCommerceRouteService.currentRouteSection.set(
      ECommerceRouteSection.OrderSummaries,
    );
  }

  ngOnDestroy(): void {
    this._eCommerceRouteService.currentRouteSection.set(undefined);
  }

  readonly getOrderStatusColorClass = getOrderStatusColorClass;
}
