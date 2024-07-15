import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { ProductVariantMpService } from '../../../services/product-variant-mp.service';
import { ProductVariantMp } from '../../../models/product-variant/product-variant-mp.interface';

export const mpProductVariantUpdateResolver: ResolveFn<ProductVariantMp> = (
  route,
  state,
  productVariantMpService = inject(ProductVariantMpService),
  router = inject(Router),
) => {
  return forkJoin([
    productVariantMpService.getProductVariant(route.params['productVariantId']),
    productVariantMpService.getValidatorParameters(),
  ]).pipe(
    map(([response]) => {
      if (response.data.productId !== route.params['productId']) {
        throw Error('Wrong ProductId');
      }

      return response.data;
    }),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
