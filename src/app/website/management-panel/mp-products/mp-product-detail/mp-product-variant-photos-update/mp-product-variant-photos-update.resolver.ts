import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { forkJoin, map, catchError, of } from 'rxjs';
import { ProductVariantMp } from '../../../models/product-variant/product-variant-mp.interface';
import { ProductVariantPhotoItemMp } from '../../../models/product-variant/product-variant-photo-item-mp.interface';
import { ProductMp } from '../../../models/product/product-mp.interface';
import { ProductVariantMpService } from '../../../services/product-variant-mp.service';

export type MpProductVariantPhotosUpdateResolvedData = {
  productVariant: ProductVariantMp;
  photos: ProductVariantPhotoItemMp[];
};

export const mpProductVariantPhotosUpdateResolver: ResolveFn<ProductMp> = (
  route,
  state,
  productVariantMpService = inject(ProductVariantMpService),
  router = inject(Router),
) => {
  const productId = route.paramMap.get('productId')!;
  const productVariantId = route.paramMap.get('productVariantId')!;

  return forkJoin([
    productVariantMpService.getProductVariant(productVariantId),
    productVariantMpService.getProductVariantPhotoItems(productVariantId),
    productVariantMpService.getValidatorParameters(),
  ]).pipe(
    map(([productVariantResponse, photosResponse]) => {
      if (productVariantResponse.data.productId != productId) {
        throw Error('Invalid ProductId');
      }

      return {
        productVariant: productVariantResponse.data,
        photos: photosResponse.data,
      } as MpProductVariantPhotosUpdateResolvedData;
    }),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
