import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { SearchQueryParams } from '../../../../shared/models/requests/query-models/common/search-query-params.interface';
import { GetPagedProductsEcSortBy } from '../query-sort-by/get-paged-products-ec-sort-by.enum';

export interface GetPagedProductsEcQueryParams
  extends PaginationQueryParams,
    SearchQueryParams {
  sortBy: GetPagedProductsEcSortBy;
  encodedCategoryName?: string;
  productOptionParam?: string;
  minPrice?: number;
  maxPrice?: number;
}
