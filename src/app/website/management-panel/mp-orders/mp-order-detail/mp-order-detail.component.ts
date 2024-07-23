import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { OrderStatusHistoryTimelineComponent } from '../../../../shared/components/order-status-history-timeline/order-status-history-timeline.component';
import { PhotoComponent } from '../../../../shared/components/photo/photo.component';
import { getOrderStatusColorClass } from '../../../../shared/functions/order-status-functions';
import { UserRole } from '../../../../shared/models/user/user-role.enum';
import { OrderDetailMp } from '../../models/order/order-detail-mp.interface';

@Component({
  selector: 'app-mp-order-detail',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatDividerModule,
    DatePipe,
    CurrencyPipe,
    AvatarComponent,
    RouterLink,
    PhotoComponent,
    MatIconModule,
    MatButtonModule,
    NgClass,
    OrderStatusHistoryTimelineComponent,
  ],
  templateUrl: './mp-order-detail.component.html',
  styleUrl: './mp-order-detail.component.scss',
})
export class MpOrderDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Orders', routerLink: '../' },
  ];

  readonly UserRole = UserRole;

  readonly getOrderStatusColorClass = getOrderStatusColorClass;

  readonly order = toSignal(
    this._activatedRoute.data.pipe(
      map(({ orderDetail }) => {
        const data = orderDetail as OrderDetailMp;
        this.breadcrumbsItems.push({ label: data.id });
        return data;
      }),
    ),
  );
}
