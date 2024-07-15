import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { OrderEcService } from '../services/order-ec.service';
import { Observable, catchError, map, of } from 'rxjs';
import { OrderWithProducts } from '../../../shared/models/order/order-with-products.interface';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

export const ecOrderSummaryResolver: ResolveFn<
  Observable<OrderWithProducts>
> = (
  route,
  state,
  orderEcService = inject(OrderEcService),
  router = inject(Router),
) => {
  const orderId = route.params['orderId'] as string;

  return orderEcService.get(orderId).pipe(
    map((response) => response.data),
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === HttpStatusCode.NotFound
      ) {
        router.navigate(['page-not-found']);
      }

      router.navigate(['./']);

      return of(error);
    }),
  );
};
