import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ShoppingCartEcService } from './services/shopping-cart-ec.service';
import { AuthService } from '../authenticate/auth.service';
import { map } from 'rxjs';
import { CategoryEcService } from './services/category-ec.service';

export const ecMainResolver: ResolveFn<void> = (
  route,
  state,
  shoppingCartEcService = inject(ShoppingCartEcService),
  authService = inject(AuthService),
  categoryEcService = inject(CategoryEcService),
) => {
  categoryEcService.loadCategories();
  if (
    authService.isAuthenticated &&
    !shoppingCartEcService.shoppingCartItems()
  ) {
    return shoppingCartEcService
      .verifyShoppingCart()
      .pipe(map(() => undefined));
  }

  return undefined;
};
