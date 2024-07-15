import { ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { InvalidFiltersParametersData } from '../../../shared/components/invalid-filters-parameters/invalid-filters-parameters-data.class';
import { initialQueryParamMapIsValid, navigateToInvalidFiltersPaged, isInEnum, isDate } from '../../../shared/functions/helper-functions';
import { Order } from '../../../shared/models/order/order.interface';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { GetPagedOrdersEcQueryParams } from '../../e-commerce/models/query-params/get-paged-orders-ec-query-params.interface';
import { GetPagedOrdersEcSortBy } from '../../e-commerce/models/query-sort-by/get-paged-orders-ec-sort-by.enum';
import { OrderEcService } from '../../e-commerce/services/order-ec.service';

export type AcPagedOrdersResolvedData = {
  response: ApiPagedResponse<Order>;
  queryParams: GetPagedOrdersEcQueryParams;
};

const redirectInvalidQueryRoute = [
  'account',
  'products',
  InvalidFiltersParametersData.urlPath,
];

export const accountPagedOrdersResolver: ResolveFn<
  AcPagedOrdersResolvedData | void
> = (
  route,
  state,
  orderEcService = inject(OrderEcService),
  router = inject(Router),
) => {
  const queryParamMap = route.queryParamMap;

  if (
    !initialQueryParamMapIsValid(
      queryParamMap,
      orderEcService.availableFilters.concat(
        orderEcService.availablePaginationQueryKey,
      ),
    )
  ) {
    navigateToInvalidFiltersPaged(redirectInvalidQueryRoute, router);
    return;
  }

  const requestQueryParams: GetPagedOrdersEcQueryParams = {
    pageNumber: 1,
    pageSize: orderEcService.minPageSize,
    sortBy: orderEcService.defaultSortBy,
    sortDirection: orderEcService.defaultSortDirection,
    fromDate: undefined,
    toDate: undefined,
    inclusiveFromDate: true,
    inclusiveToDate: false,
  };

  const pageSize = queryParamMap.get('PageSize');

  if (pageSize != null) {
    const pageSizeNumber = +pageSize;
    if (!isNaN(pageSizeNumber)) {
      if (!orderEcService.allowedPageSizes.includes(pageSizeNumber)) {
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
    if (isInEnum(sortBy, GetPagedOrdersEcSortBy)) {
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

  return orderEcService.getPagedData(requestQueryParams).pipe(
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
      } as AcPagedOrdersResolvedData;
    }),
  );
};
