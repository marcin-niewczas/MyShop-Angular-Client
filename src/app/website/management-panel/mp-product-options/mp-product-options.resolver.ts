import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ProductOptionMpService } from '../services/product-option-mp.service';
import { ProductOptionTypeMpQueryType } from '../models/query-types/product-option-type-mp-query-type.enum';
import { tap } from 'rxjs';
import { InvalidFiltersParametersData } from '../../../shared/components/invalid-filters-parameters/invalid-filters-parameters-data.class';
import { initialQueryParamMapIsValid, navigateToInvalidFiltersPaged, isInEnum } from '../../../shared/functions/helper-functions';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ProductOptionMp } from '../models/product-option/product-option-mp.interface';
import { GetPagedProductOptionsMpQueryParams } from '../models/query-params/get-paged-product-options-mp-query-params.interface';
import { GetPagedProductOptionsMpSortBy } from '../models/query-sort-by/get-paged-product-options-mp-sort-by.enum';
import { ProductOptionsSubtypeMpQueryType } from '../models/query-types/product-options-mp-query-type.enum';

const redirectInvalidQueryRoute = [
  'management-panel',
  'product-options',
  InvalidFiltersParametersData.urlPath,
];

export const mpProductOptionsResolver: ResolveFn<
  ApiPagedResponse<ProductOptionMp> | void
> = (
  route,
  state,
  productOptionMpService = inject(ProductOptionMpService),
  router = inject(Router),
) => {
  const queryParamMap = route.queryParamMap;

  if (
    !initialQueryParamMapIsValid(
      queryParamMap,
      productOptionMpService.availableFilters.concat(
        productOptionMpService.availablePaginationQueryKey,
      ),
    )
  ) {
    navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
  }

  const requestQueryParams: GetPagedProductOptionsMpQueryParams = {
    pageNumber: 1,
    pageSize: productOptionMpService.minPageSize,
    queryType: ProductOptionTypeMpQueryType.All,
    subqueryType: ProductOptionsSubtypeMpQueryType.All,
  };

  const pageSize = queryParamMap.get('PageSize');

  if (pageSize != null) {
    const pageSizeNumber = +pageSize;
    if (!isNaN(pageSizeNumber)) {
      if (!productOptionMpService.allowedPageSize.includes(pageSizeNumber)) {
        navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
        return;
      }

      requestQueryParams.pageSize = pageSizeNumber;
    } else {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      return;
    }
  } else {
    requestQueryParams.pageSize = productOptionMpService.minPageSize;
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
    if (isInEnum(sortBy, GetPagedProductOptionsMpSortBy)) {
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

  return productOptionMpService.getPagedData(requestQueryParams).pipe(
    tap((response) => {
      if (
        response.totalPages !== 0 &&
        response.totalPages < requestQueryParams.pageNumber &&
        requestQueryParams.searchPhrase == undefined
      ) {
        navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
        return;
      }
    }),
  );
};
