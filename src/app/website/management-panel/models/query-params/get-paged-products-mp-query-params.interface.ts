import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { SearchQueryParams } from '../../../../shared/models/requests/query-models/common/search-query-params.interface';
import { SortQueryParams } from '../../../../shared/models/requests/query-models/common/sort-query-params.interface';
import { GetPagedProductsMpSortBy } from '../query-sort-by/get-paged-products-mp-sort-by.interface';

export interface GetPagedProductsMpQueryParams
  extends PaginationQueryParams,
    SortQueryParams<GetPagedProductsMpSortBy>,
    SearchQueryParams {}
