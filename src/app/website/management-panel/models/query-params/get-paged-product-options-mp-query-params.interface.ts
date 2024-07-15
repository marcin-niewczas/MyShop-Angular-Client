import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import {
  QueryTypeParam,
  SubqueryTypeParam,
} from '../../../../shared/models/requests/query-models/common/query-type-param.interface';
import { SearchQueryParams } from '../../../../shared/models/requests/query-models/common/search-query-params.interface';
import { SortQueryParams } from '../../../../shared/models/requests/query-models/common/sort-query-params.interface';
import { GetPagedProductOptionsMpSortBy } from '../query-sort-by/get-paged-product-options-mp-sort-by.enum';
import { ProductOptionTypeMpQueryType } from '../query-types/product-option-type-mp-query-type.enum';
import { ProductOptionsSubtypeMpQueryType } from '../query-types/product-options-mp-query-type.enum';

export interface GetPagedProductOptionsMpQueryParams
  extends PaginationQueryParams,
    SortQueryParams<GetPagedProductOptionsMpSortBy>,
    SearchQueryParams,
    QueryTypeParam<ProductOptionTypeMpQueryType>,
    SubqueryTypeParam<ProductOptionsSubtypeMpQueryType> {}
