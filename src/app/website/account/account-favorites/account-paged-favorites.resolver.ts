import { inject } from '@angular/core';
import { ParamMap, ResolveFn, Router } from '@angular/router';
import { FavoriteAcService } from '../services/favorite-ac.service';

import { GetPagedFavoritesAcSortBy } from '../models/query-sort-by/get-paged-favorites-ac-sort-by.enum';
import { GetPagedFavoritesAcQueryParams } from '../models/favorite/get-paged-favorites-ac-query-params.interface';
import { map } from 'rxjs';
import { InvalidFiltersParametersData } from '../../../shared/components/invalid-filters-parameters/invalid-filters-parameters-data.class';
import {
  initialQueryParamMapIsValid,
  navigateToInvalidFiltersPaged,
  isInEnum,
} from '../../../shared/functions/helper-functions';
import { ProductListItem } from '../../../shared/models/product/product-list-item.interface';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';

export type ResolvedDataOfPagedFavoritesAc = {
  queryParams: GetPagedFavoritesAcQueryParams;
  response: ApiPagedResponse<ProductListItem>;
  paramMap: ParamMap;
};

const redirectInvalidQueryRoute = [
  'management-panel',
  'product-options',
  InvalidFiltersParametersData.urlPath,
];

export const accountPagedFavoritesResolver: ResolveFn<
  ResolvedDataOfPagedFavoritesAc | void
> = (
  route,
  state,
  favoriteAcService = inject(FavoriteAcService),
  router = inject(Router),
) => {
  const requestQueryParams: GetPagedFavoritesAcQueryParams = {
    pageNumber: 1,
    pageSize: favoriteAcService.minPageSize,
    sortBy: GetPagedFavoritesAcSortBy.Newest,
    sortDirection: SortDirection.Desc,
  };

  const queryParamMap = route.queryParamMap;

  if (
    !initialQueryParamMapIsValid(
      queryParamMap,
      favoriteAcService.availableFilters.concat(
        favoriteAcService.availablePaginationQueryKey,
      ),
    )
  ) {
    navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
    return;
  }

  const pageSize = queryParamMap.get('PageSize');

  if (pageSize != null) {
    const pageSizeNumber = +pageSize;
    if (!isNaN(pageSizeNumber)) {
      if (!favoriteAcService.allowedPageSize.includes(pageSizeNumber)) {
        navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      }

      requestQueryParams.pageSize = pageSizeNumber;
    } else {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      return;
    }
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
    if (isInEnum(sortBy, GetPagedFavoritesAcSortBy)) {
      requestQueryParams.sortBy = sortBy;
    } else {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      return;
    }
  }

  const searchPhrase = queryParamMap.get('SearchPhrase');

  if (searchPhrase != null) {
    requestQueryParams.searchPhrase = searchPhrase;
  }

  return favoriteAcService.getPagedData(requestQueryParams).pipe(
    map((response) => {
      if (
        response.totalPages !== 0 &&
        response.totalPages < requestQueryParams.pageNumber &&
        requestQueryParams.searchPhrase == undefined
      ) {
        navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      }

      return {
        response,
        queryParams: requestQueryParams,
        paramMap: queryParamMap,
      } as ResolvedDataOfPagedFavoritesAc;
    }),
  );
};
