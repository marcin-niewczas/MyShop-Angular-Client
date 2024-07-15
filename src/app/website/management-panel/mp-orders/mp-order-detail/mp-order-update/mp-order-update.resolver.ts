import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { OrderMpService } from '../../../services/order-mp.service';
import { map, catchError, of, switchMap } from 'rxjs';

export const mpOrderUpdateResolver: ResolveFn<boolean> = (
  route,
  state,
  router = inject(Router),
  orderMpService = inject(OrderMpService),
) => {
  return orderMpService.getOrder(route.params['orderId']).pipe(
    switchMap((orderResponse) =>
      orderMpService
        .getValidatorParameters()
        .pipe(map(() => orderResponse.data)),
    ),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
