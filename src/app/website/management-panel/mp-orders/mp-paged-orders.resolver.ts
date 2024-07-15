import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { OrderMpService } from '../services/order-mp.service';
import { GetPagedOrdersMpQueryParams } from '../models/query-params/get-paged-orders-mp-query-params.interface';
import { PagedOrderMp } from '../models/order/paged-order-mp.interface';
import { map } from 'rxjs';
import { GetPagedOrdersMpSortBy } from '../models/query-sort-by/get-paged-orders-mp-sort-by.enum';
import { InvalidFiltersParametersData } from '../../../shared/components/invalid-filters-parameters/invalid-filters-parameters-data.class';
import { initialQueryParamMapIsValid, navigateToInvalidFiltersPaged, isInEnum, isDate } from '../../../shared/functions/helper-functions';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';

export type MpPagedOrdersResolvedData = {
  response: ApiPagedResponse<PagedOrderMp>;
  queryParams: GetPagedOrdersMpQueryParams;
};

const redirectInvalidQueryRoute = [
  'management-panel',
  'orders',
  InvalidFiltersParametersData.urlPath,
];

export const mpPagedOrdersResolver: ResolveFn<
  MpPagedOrdersResolvedData | void
> = (
  route,
  state,
  orderMpService = inject(OrderMpService),
  router = inject(Router),
) => {
  const queryParamMap = route.queryParamMap;

  if (
    !initialQueryParamMapIsValid(
      queryParamMap,
      orderMpService.availableFilters.concat(
        orderMpService.availablePaginationQueryKey,
      ),
    )
  ) {
    navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
    return;
  }

  const requestQueryParams: GetPagedOrdersMpQueryParams = {
    pageNumber: 1,
    pageSize: orderMpService.minPageSize,
    sortBy: orderMpService.defaultSortBy,
    sortDirection: orderMpService.defaultSortDirection,
    fromDate: undefined,
    toDate: undefined,
    inclusiveFromDate: true,
    inclusiveToDate: false,
  };

  const pageSize = queryParamMap.get('PageSize');

  if (pageSize != null) {
    const pageSizeNumber = +pageSize;
    if (!isNaN(pageSizeNumber)) {
      if (!orderMpService.allowedPageSizes.includes(pageSizeNumber)) {
        navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
        return;
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
    if (isInEnum(sortBy, GetPagedOrdersMpSortBy)) {
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

  const fromDate = queryParamMap.get('FromDate');

  if (fromDate != null) {
    if (isDate(fromDate)) {
      requestQueryParams.fromDate = fromDate;
    } else {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      return;
    }
  }

  const toDate = queryParamMap.get('ToDate');

  if (toDate != null) {
    if (isDate(toDate)) {
      requestQueryParams.toDate = toDate;
    } else {
      navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
      return;
    }
  }

  return orderMpService.getPagedData(requestQueryParams).pipe(
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
      } as MpPagedOrdersResolvedData;
    }),
  );
};
