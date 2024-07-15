import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ProductOptionMpService } from '../../services/product-option-mp.service';
import { Observable, catchError, map, of } from 'rxjs';

export const mpProductOptionCreateResolver: ResolveFn<Observable<void>> = (
  route,
  state,
  productOptionMpService = inject(ProductOptionMpService),
  router = inject(Router),
) => {
  return productOptionMpService.getValidatorParameters().pipe(
    map(() => undefined),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
