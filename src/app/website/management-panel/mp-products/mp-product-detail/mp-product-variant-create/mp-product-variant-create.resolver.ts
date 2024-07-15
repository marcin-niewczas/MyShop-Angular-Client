import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { map, catchError, of, forkJoin } from 'rxjs';
import { ProductMpService } from '../../../services/product-mp.service';
import { ProductVariantMpService } from '../../../services/product-variant-mp.service';

export const mpProductVariantCreateResolver: ResolveFn<boolean> = (
  route,
  state,
  productMpService = inject(ProductMpService),
  productVariantMpService = inject(ProductVariantMpService),
  router = inject(Router),
) => {
  return forkJoin([
    productMpService.getById(route.paramMap.get('productId')!),
    productVariantMpService.getValidatorParameters(),
  ]).pipe(
    map(([response]) => response.data),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
