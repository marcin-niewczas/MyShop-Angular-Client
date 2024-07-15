import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ProductMpService } from '../../services/product-mp.service';
import { map, catchError, of } from 'rxjs';

export const mpProductCreateResolver: ResolveFn<void> = (
  route,
  state,
  productMpService = inject(ProductMpService),
  router = inject(Router),
) => {
  return productMpService.getValidatorParameters().pipe(
    map(() => undefined),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
