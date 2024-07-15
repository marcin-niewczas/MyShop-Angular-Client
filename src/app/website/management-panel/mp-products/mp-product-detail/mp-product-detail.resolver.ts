import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ProductMpService } from '../../services/product-mp.service';
import { map, catchError, of, forkJoin } from 'rxjs';
import { ProductMp } from '../../models/product/product-mp.interface';
import { ProductReviewRateStats } from '../../../../shared/models/product/product-review-rate-stats.interface';
import { ApiPagedResponse } from '../../../../shared/models/responses/api-paged-response.interface';
import { PagedProductVariantMp } from '../../models/product-variant/paged-product-variant-mp.interface';

export type MpProductDetailResolvedData = {
  product: ProductMp;
  pagedProductVariantsResponse: ApiPagedResponse<PagedProductVariantMp>;
  productReviewRateStats: ProductReviewRateStats;
};

export const mpProductDetailResolver: ResolveFn<ProductMp> = (
  route,
  state,
  productMpService = inject(ProductMpService),
  router = inject(Router),
) => {
  const productId = route.paramMap.get('productId')!;

  return forkJoin([
    productMpService.getById(productId),
    productMpService.getPagedProductVariantsByProductId(productId, {
      pageNumber: 1,
      pageSize: 10,
    }),
    productMpService.getProductReviewRateStats(productId),
  ]).pipe(
    map(
      ([
        productResponse,
        pagedProductVariantsResponse,
        productReviewRateStatsResponse,
      ]) => {
        return {
          product: productResponse.data,
          pagedProductVariantsResponse,
          productReviewRateStats: productReviewRateStatsResponse.data,
        } as MpProductDetailResolvedData;
      },
    ),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
