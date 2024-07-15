import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { map, catchError, of, forkJoin, switchMap, Observable } from 'rxjs';
import { PaginationQueryParams } from '../../../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { ApiPagedResponse } from '../../../../../../shared/models/responses/api-paged-response.interface';
import { ProductDetailOptionOfProductMp } from '../../../../models/product-option/details/product-detail-option-of-product-mp.interface';
import { ProductMp } from '../../../../models/product/product-mp.interface';
import { ProductMpService } from '../../../../services/product-mp.service';

export type MpProductDetailOptionsOfProductUpdateResolvedData = {
  product: ProductMp;
  mainProductDetailOption: ProductDetailOptionOfProductMp;
  additionalProductDetailOptions: ProductDetailOptionOfProductMp[];
  queryParams: PaginationQueryParams;
};

export const mpProductDetailOptionsOfProductUpdateResolver: ResolveFn<
  MpProductDetailOptionsOfProductUpdateResolvedData
> = (
  route,
  state,
  productMpService = inject(ProductMpService),
  router = inject(Router),
) => {
  const productId = route.paramMap.get('productId')!;

  const getPagedProductDetailOptionsByProductIdQueryParams: PaginationQueryParams =
    {
      pageNumber: 1,
      pageSize: 10,
    };

  return forkJoin([
    productMpService.getById(productId),
    productMpService
      .getPagedProductDetailOptionsByProductId(
        productId,
        getPagedProductDetailOptionsByProductIdQueryParams,
      )
      .pipe(
        switchMap((firstResponse) => {
          if (firstResponse.isNext) {
            const taskList: Observable<
              ApiPagedResponse<ProductDetailOptionOfProductMp>
            >[] = [];

            for (let i = 2; i <= firstResponse.totalCount; i++) {
              getPagedProductDetailOptionsByProductIdQueryParams.pageNumber += 1;
              taskList.push(
                productMpService.getPagedProductDetailOptionsByProductId(
                  productId,
                  getPagedProductDetailOptionsByProductIdQueryParams,
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
    map(([productResponse, productDetailOptions]) => {
      return {
        product: productResponse.data,
        mainProductDetailOption: productDetailOptions[0],
        additionalProductDetailOptions: productDetailOptions.splice(
          1,
          productDetailOptions.length,
        ),
        queryParams: getPagedProductDetailOptionsByProductIdQueryParams,
      } as MpProductDetailOptionsOfProductUpdateResolvedData;
    }),
    catchError((error) => {
      router.navigate(['not-found']);
      return of(error);
    }),
  );
};
