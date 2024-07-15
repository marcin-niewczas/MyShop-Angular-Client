import { BaseProductDetailEc } from '../models/product/product-detail-ec.interface';
import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ProductEcService } from '../services/product-ec.service';
import { Observable, forkJoin, map } from 'rxjs';
import { AuthService } from '../../authenticate/auth.service';
import { FavoriteEcService } from '../services/favorite-ec.service';

export type ProductDetailEcResolverData = {
  productDetail: BaseProductDetailEc;
  isFavorite?: boolean;
};

export const ecProductDetailResolver: ResolveFn<
  Observable<ProductDetailEcResolverData>
> = (
  route,
  state,
  productEcService = inject(ProductEcService),
  favoriteEcService = inject(FavoriteEcService),
  hasCustomerPermission = inject(AuthService).hasCustomerPermission,
) => {
  const encodedProductName = route.paramMap.get('encodedProductName')!;

  if (hasCustomerPermission()) {
    return forkJoin([
      productEcService.getProductDetail(encodedProductName),
      favoriteEcService.getStatusOfFavorite(encodedProductName),
    ]).pipe(
      map(([productDetailResponse, favoriteResponse]) => {
        return {
          productDetail: productDetailResponse.data,
          isFavorite: favoriteResponse.data.value,
        } as ProductDetailEcResolverData;
      }),
    );
  }

  return productEcService.getProductDetail(encodedProductName).pipe(
    map((productDetailResponse) => {
      return {
        productDetail: productDetailResponse.data,
        isFavorite: undefined,
      } as ProductDetailEcResolverData;
    }),
  );
};
