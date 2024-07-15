import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { UserAddressAcService } from '../services/user-address-ac.service';

export const accountAddressValidatorParametersResolver: ResolveFn<void> = (
  route,
  state,
  userAddressAcService = inject(UserAddressAcService),
  router = inject(Router),
) => {
  return userAddressAcService.getValidatorParameters().pipe(
    map(() => undefined),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
