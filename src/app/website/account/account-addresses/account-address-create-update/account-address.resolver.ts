import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { UserAddressAc } from '../../models/user/user-address-ac.interface';
import { UserAddressAcService } from '../../services/user-address-ac.service';

export const accountAddressUpdateResolver: ResolveFn<
  Observable<UserAddressAc>
> = (
  route,
  state,
  userAddressAcService = inject(UserAddressAcService),
  router = inject(Router),
) => {
  const addressId = route.params['addressId'];

  return forkJoin([
    userAddressAcService.get(addressId),
    userAddressAcService.getValidatorParameters(),
  ]).pipe(
    map(([response]) => response.data),
    catchError((error) => {
      router.navigate(['page-not-found']);
      return of(error);
    }),
  );
};

export const accountAddressCreateResolver: ResolveFn<void> = (
  route,
  state,
  userAddressAcService = inject(UserAddressAcService),
  router = inject(Router),
) => {
  return forkJoin([
    userAddressAcService.getValidatorParameters(),
    userAddressAcService.getUserAddresesCount(),
  ]).pipe(
    map(([validatorParameters, count]) => {
      if (validatorParameters.maxCountUserAddresses <= count) {
        throw Error('The User have maximum count of user addresses.');
      }

      return undefined;
    }),
    catchError((error) => {
      if (error instanceof Error) {
        router.navigate(['account', 'addresses']);
      } else {
        router.navigate(['not-found']);
      }

      return of(error);
    }),
  );
};
