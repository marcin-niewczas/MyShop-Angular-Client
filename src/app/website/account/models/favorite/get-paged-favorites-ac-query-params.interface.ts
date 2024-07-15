import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { SearchQueryParams } from '../../../../shared/models/requests/query-models/common/search-query-params.interface';
import { SortQueryParams } from '../../../../shared/models/requests/query-models/common/sort-query-params.interface';
import { GetPagedFavoritesAcSortBy } from '../query-sort-by/get-paged-favorites-ac-sort-by.enum';

export interface GetPagedFavoritesAcQueryParams
  extends PaginationQueryParams,
    SearchQueryParams,
    SortQueryParams<GetPagedFavoritesAcSortBy> {}
