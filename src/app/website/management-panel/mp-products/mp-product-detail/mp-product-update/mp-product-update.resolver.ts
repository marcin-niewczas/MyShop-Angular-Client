import { ResolveFn, Router } from '@angular/router';
import { forkJoin, map, catchError, of } from 'rxjs';
import { ProductMp } from '../../../models/product/product-mp.interface';
import { inject } from '@angular/core';
import { ProductMpService } from '../../../services/product-mp.service';

export const mpProductUpdateResolver: ResolveFn<ProductMp> = (
  route,
  state,
  productMpService = inject(ProductMpService),
  router = inject(Router),
) => {
  const productId = route.paramMap.get('productId')!;

  return forkJoin([
    productMpService.getById(productId),
    productMpService.getValidatorParameters(),
  ]).pipe(
    map(([productResponse]) => productResponse.data),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
