import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map } from 'rxjs';

export const isAuthResolver: ResolveFn<void> = (
  route,
  state,
  router = inject(Router),
  authService = inject(AuthService)
) => {
  if (authService.isAuthenticated && authService.hasCustomerPermission()) {
    router.navigate([]);
    return;
  }

  return authService.getValidatorParameters().pipe(map(() => undefined));
};
