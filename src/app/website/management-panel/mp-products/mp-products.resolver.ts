import { ResolveFn, Router } from '@angular/router';
import { ProductMpService } from '../services/product-mp.service';
import { inject } from '@angular/core';
import { GetPagedProductsMpQueryParams } from '../models/query-params/get-paged-products-mp-query-params.interface';
import { map } from 'rxjs';
import { InvalidFiltersParametersData } from '../../../shared/components/invalid-filters-parameters/invalid-filters-parameters-data.class';
import {
  initialQueryParamMapIsValid,
  navigateToInvalidFiltersPaged,
  isInEnum,
} from '../../../shared/functions/helper-functions';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ProductMp } from '../models/product/product-mp.interface';
import { GetPagedProductsMpSortBy } from '../models/query-sort-by/get-paged-products-mp-sort-by.interface';

const redirectInvalidQueryRoute = [
  'management-panel',
  'products',
  InvalidFiltersParametersData.urlPath,
];

export const mpProductsResolver: ResolveFn<
  ApiPagedResponse<ProductMp> | void
> = (
  route,
  state,
  productMpService = inject(ProductMpService),
  router = inject(Router),
) => {
  const queryParamMap = route.queryParamMap;

  if (
    !initialQueryParamMapIsValid(
      queryParamMap,
      productMpService.availableFiltersForPagedProducts.concat(
        productMpService.availablePaginationQueryKeyForPagedProducts,
      ),
    )
  ) {
    navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
  }

  const requestQueryParams = {
    pageNumber: 1,
    pageSize: productMpService.minPageSizeForPagedProducts,
  } as GetPagedProductsMpQueryParams;

  const pageSize = queryParamMap.get('PageSize');

  if (pageSize != null) {
    const pageSizeNumber = +pageSize;
    if (!isNaN(pageSizeNumber)) {
      if (
        !productMpService.allowedPageSizeForPagedProducts.includes(
          pageSizeNumber,
        )
      ) {
        navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
        return;
      }

      requestQueryParams.pageSize = pageSizeNumber;
    } else {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      return;
    }
  } else {
    requestQueryParams.pageSize = productMpService.minPageSizeForPagedProducts;
  }

  const pageNumber = queryParamMap.get('PageNumber');

  if (pageNumber != null) {
    const pageNumberNumber = +pageNumber;
    if (!isNaN(pageNumberNumber)) {
      requestQueryParams.pageNumber = +pageNumber;
    } else {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      return;
    }
  } else {
    requestQueryParams.pageNumber = 1;
  }

  const sortDirection = queryParamMap.get('SortDirection');
  const sortBy = queryParamMap.get('SortBy');

  if (sortDirection != null) {
    if (isInEnum(sortDirection, SortDirection)) {
      requestQueryParams.sortDirection = sortDirection;
    } else {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      return;
    }
  }

  if (sortBy != null) {
    if (isInEnum(sortBy, GetPagedProductsMpSortBy)) {
      requestQueryParams.sortBy = sortBy;
    } else {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      return;
    }
  }

  const searchPhrase = queryParamMap.get('SearchPhrase');

  if (searchPhrase != null) {
    requestQueryParams.searchPhrase = searchPhrase;
  } else {
    requestQueryParams.searchPhrase = undefined;
  }

  return productMpService.getPagedProducts(requestQueryParams).pipe(
    map((response) => {
      if (
        response.totalPages !== 0 &&
        response.totalPages < requestQueryParams.pageNumber &&
        requestQueryParams.searchPhrase == undefined
      ) {
        navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      }

      return response;
    }),
  );
};
