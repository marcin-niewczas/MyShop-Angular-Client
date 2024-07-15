import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { UserAcService } from '../services/user-ac.service';

export const accountSecurityValidatorParametersResolver: ResolveFn<void> = (
  route,
  state,
  userAddressAcService = inject(UserAcService),
  router = inject(Router),
) => {
  return userAddressAcService.getSecurityValidatorParameters().pipe(
    map(() => undefined),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
