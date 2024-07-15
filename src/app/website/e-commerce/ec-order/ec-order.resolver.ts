import { ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ShoppingCartEcService } from '../services/shopping-cart-ec.service';
import {
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { OrderEcService } from '../services/order-ec.service';
import { AuthService } from '../../authenticate/auth.service';

export const ecCheckoutResolver: ResolveFn<
  Observable<{ checkoutId: string }> | void
> = (
  route,
  state,
  router = inject(Router),
  authService = inject(AuthService),
  shoppingCartEcService = inject(ShoppingCartEcService),
  orderEcService = inject(OrderEcService),
) => {
  if (!authService.isAuthenticated) {
    router.navigate([]);
    return;
  }

  shoppingCartEcService.isCheckoutProcess.set(true);

  if (!shoppingCartEcService.shoppingCartItems()) {
    return forkJoin([
      shoppingCartEcService.verifyShoppingCart(),
      orderEcService.getValidatorParameters(),
    ]).pipe(
      switchMap(([shoppingCartDetail]) => {
        if (
          !shoppingCartDetail.shoppingCartItems ||
          shoppingCartDetail.shoppingCartItems.length <= 0 ||
          (shoppingCartDetail.changes &&
            Object.keys(shoppingCartDetail.changes).length > 0)
        ) {
          return throwError(() => 'Basket is empty');
        }

        return shoppingCartEcService
          .checkout()
          .pipe(map((response) => response.data));
      }),
      catchError((error) => {
        router.navigate([]);
        shoppingCartEcService.isCheckoutProcess.set(false);
        return of(error);
      }),
    );
  }

  return forkJoin([
    shoppingCartEcService.checkout(),
    orderEcService.getValidatorParameters(),
  ]).pipe(
    map(([response]) => response.data),
    catchError((error) =>
      shoppingCartEcService.verifyShoppingCart().pipe(
        tap(() => {
          router.navigate([]);
          shoppingCartEcService.isCheckoutProcess.set(false);
          return of(error);
        }),
      ),
    ),
  );
};
