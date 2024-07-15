import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ProductOptionMpService } from '../../services/product-option-mp.service';
import { ProductOptionMp } from '../../models/product-option/product-option-mp.interface';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

export const mpProductOptionDetailResolver: ResolveFn<
  Observable<ProductOptionMp>
> = (
  route,
  state,
  productOptionMpService = inject(ProductOptionMpService),
  router = inject(Router),
) => {
  return forkJoin([
    productOptionMpService.getById(route.paramMap.get('productOptionId')!),
    productOptionMpService.getValidatorParameters(),
  ]).pipe(
    map(([response]) => response.data),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
