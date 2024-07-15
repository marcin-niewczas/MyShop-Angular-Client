import { GetPagedCategoriesQueryParam } from '../../../../shared/models/requests/query-models/category/get-paged-categories-query-param.enum';
import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { QueryTypeParam } from '../../../../shared/models/requests/query-models/common/query-type-param.interface';

export interface GetPagedCategoriesEcQueryParams
  extends PaginationQueryParams,
    QueryTypeParam<GetPagedCategoriesQueryParam> {}
