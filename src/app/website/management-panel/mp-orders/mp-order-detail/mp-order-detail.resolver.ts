import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { OrderMpService } from '../../services/order-mp.service';
import { Observable, catchError, map, of } from 'rxjs';
import { OrderDetailMp } from '../../models/order/order-detail-mp.interface';

export const mpOrderDetailResolver: ResolveFn<Observable<OrderDetailMp>> = (
  route,
  state,
  router = inject(Router),
  orderMpService = inject(OrderMpService),
) => {
  return orderMpService.getOrderDetails(route.params['orderId']).pipe(
    map((response) => response.data),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
