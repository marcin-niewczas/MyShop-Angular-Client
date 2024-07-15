import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { SearchQueryParams } from '../../../../shared/models/requests/query-models/common/search-query-params.interface';
import { SortQueryParams } from '../../../../shared/models/requests/query-models/common/sort-query-params.interface';
import { TimestampQueryParams } from '../../../../shared/models/requests/query-models/common/timestamp-query-params.interface';
import { GetPagedOrdersMpSortBy } from '../query-sort-by/get-paged-orders-mp-sort-by.enum';

export interface GetPagedOrdersMpQueryParams
  extends PaginationQueryParams,
    TimestampQueryParams,
    SearchQueryParams,
    SortQueryParams<GetPagedOrdersMpSortBy> {}