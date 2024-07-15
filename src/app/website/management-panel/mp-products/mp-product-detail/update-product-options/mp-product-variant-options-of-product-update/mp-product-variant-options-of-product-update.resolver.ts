import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { map, catchError, of, forkJoin, switchMap, Observable } from 'rxjs';
import { PaginationQueryParams } from '../../../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { ApiPagedResponse } from '../../../../../../shared/models/responses/api-paged-response.interface';
import { ProductVariantOptionOfProductMp } from '../../../../models/product-option/variants/product-variant-option-of-product-mp.interface';
import { ProductMp } from '../../../../models/product/product-mp.interface';
import { ProductMpService } from '../../../../services/product-mp.service';

export type MpProductVariantOptionsOfProductUpdateResolvedData = {
  product: ProductMp;
  mainProductVariantOption: ProductVariantOptionOfProductMp;
  additionalProductVariantOptions: ProductVariantOptionOfProductMp[];
  queryParams: PaginationQueryParams;
};

export const mpProductVariantOptionsOfProductUpdateResolver: ResolveFn<
  MpProductVariantOptionsOfProductUpdateResolvedData
> = (
  route,
  state,
  productMpService = inject(ProductMpService),
  router = inject(Router),
) => {
  const productId = route.paramMap.get('productId')!;

  const getPagedProductOptionValuesByProductOptionIdMpQueryParams: PaginationQueryParams =
    {
      pageNumber: 1,
      pageSize: 10,
    };

  return forkJoin([
    productMpService.getById(productId),
    productMpService
      .getPagedProductVariantOptionsByProductId(
        productId,
        getPagedProductOptionValuesByProductOptionIdMpQueryParams,
      )
      .pipe(
        switchMap((firstResponse) => {
          if (firstResponse.isNext) {
            const taskList: Observable<
              ApiPagedResponse<ProductVariantOptionOfProductMp>
            >[] = [];

            for (let i = 2; i <= firstResponse.totalCount; i++) {
              getPagedProductOptionValuesByProductOptionIdMpQueryParams.pageNumber += 1;
              taskList.push(
                productMpService.getPagedProductVariantOptionsByProductId(
                  productId,
                  getPagedProductOptionValuesByProductOptionIdMpQueryParams,
                ),
              );
            }

            return forkJoin(taskList).pipe(
              map((responses) => [
                ...firstResponse.data,
                ...responses.flatMap((x) => x.data),
              ]),
            );
          }

          return of(firstResponse.data);
        }),
      ),
  ]).pipe(
    map(([productResponse, productVariantOptions]) => {
      return {
        product: productResponse.data,
        mainProductVariantOption: productVariantOptions[0],
        additionalProductVariantOptions: productVariantOptions.splice(
          1,
          productVariantOptions.length,
        ),
        queryParams: getPagedProductOptionValuesByProductOptionIdMpQueryParams,
      } as MpProductVariantOptionsOfProductUpdateResolvedData;
    }),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
