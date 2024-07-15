import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { SearchQueryParams } from '../../../../shared/models/requests/query-models/common/search-query-params.interface';
import { SortQueryParams } from '../../../../shared/models/requests/query-models/common/sort-query-params.interface';
import { GetPagedCategoriesMpSortBy } from '../query-sort-by/get-paged-categories-mp-sort-by.enum';

export interface GetPagedProductCategoriesByCategoryRootIdMpQueryParams
  extends PaginationQueryParams,
    SearchQueryParams,
    SortQueryParams<GetPagedCategoriesMpSortBy> {}
