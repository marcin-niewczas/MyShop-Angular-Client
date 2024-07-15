import { GetPagedCategoriesQueryParam } from '../../../../shared/models/requests/query-models/category/get-paged-categories-query-param.enum';
import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { QueryTypeParam } from '../../../../shared/models/requests/query-models/common/query-type-param.interface';
import { SearchQueryParams } from '../../../../shared/models/requests/query-models/common/search-query-params.interface';
import { SortQueryParams } from '../../../../shared/models/requests/query-models/common/sort-query-params.interface';
import { GetPagedCategoriesMpSortBy } from '../query-sort-by/get-paged-categories-mp-sort-by.enum';

export interface GetPagedCategoriesMpQueryParams
  extends PaginationQueryParams,
    SortQueryParams<GetPagedCategoriesMpSortBy>,
    SearchQueryParams,
    QueryTypeParam<GetPagedCategoriesQueryParam> {}
