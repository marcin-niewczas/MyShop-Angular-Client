import { ResolveFn, Router } from '@angular/router';
import { UserAcService } from '../../services/user-ac.service';
import { inject } from '@angular/core';
import { catchError, map, of } from 'rxjs';

export const accountUserInfoUpdateResolver: ResolveFn<void> = (
  route,
  state,
  userAcService = inject(UserAcService),
  router = inject(Router),
) => {
  return userAcService.getUserValidatorParameters().pipe(
    map(() => undefined),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
