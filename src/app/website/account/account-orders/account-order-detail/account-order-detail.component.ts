import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, finalize, map, merge, switchMap, tap } from 'rxjs';
import { inAnimation } from '../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { OrderStatusHistoryTimelineComponent } from '../../../../shared/components/order-status-history-timeline/order-status-history-timeline.component';
import { PhotoComponent } from '../../../../shared/components/photo/photo.component';
import {
  orderCanBeCancelled,
  getOrderStatusColorClass,
} from '../../../../shared/functions/order-status-functions';
import { OrderWithProducts } from '../../../../shared/models/order/order-with-products.interface';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { OrderEcService } from '../../../e-commerce/services/order-ec.service';

@Component({
  selector: 'app-account-order-detail',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatDividerModule,
    DatePipe,
    CurrencyPipe,
    LoadingComponent,
    PhotoComponent,
    NgClass,
    OrderStatusHistoryTimelineComponent,
  ],
  templateUrl: './account-order-detail.component.html',
  styleUrl: './account-order-detail.component.scss',
  animations: [inAnimation],
})
export class AccountOrderDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _orderEcService = inject(OrderEcService);

  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;
  readonly breadcrumbsItems = [
    { label: 'Orders', routerLink: '/account/orders' },
    {},
  ] as BreadcrumbsItems;

  private readonly _canBeCancelled = signal(false);
  readonly canBeCancelled = this._canBeCancelled.asReadonly();

  private readonly _orderStatusColorClass = signal('');
  readonly orderStatusColorClass = this._orderStatusColorClass.asReadonly();

  private readonly _isCancellationProcess = signal(false);
  readonly isCancellationProcess = this._isCancellationProcess.asReadonly();

  private readonly _cancellationOrderSubject = new Subject<string>();

  readonly order = toSignal(
    merge(
      this._activatedRoute.data.pipe(
        map(({ order }) => order as OrderWithProducts),
      ),
      this._cancellationOrderSubject.pipe(
        tap(() => this._isCancellationProcess.set(true)),
        switchMap((id) =>
          this._orderEcService
            .cancelOrder(id)
            .pipe(
              switchMap(() =>
                this._orderEcService
                  .get(id)
                  .pipe(map((response) => response.data)),
              ),
            ),
        ),
      ),
    ).pipe(
      map((order) => {
        this.breadcrumbsItems[1] = { label: order.id };

        this._canBeCancelled.set(orderCanBeCancelled(order.status));
        this._orderStatusColorClass.set(getOrderStatusColorClass(order.status));

        return order;
      }),
      finalize(() => this._isCancellationProcess.set(false)),
    ),
  );

  cancelOrder() {
    if (this.order()) {
      this._cancellationOrderSubject.next(this.order()!.id);
    }
  }
}
