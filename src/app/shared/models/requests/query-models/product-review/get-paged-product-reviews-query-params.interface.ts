import { GetPagedProductReviewsSortBy } from '../../../sort-by/get-paged-product-reviews-sort-by.enum';
import { PaginationQueryParams } from '../common/pagination-query-params.interface';
import { SortQueryParams } from '../common/sort-query-params.interface';

export interface GetPagedProductReviewsQueryParams
  extends PaginationQueryParams,
    SortQueryParams<GetPagedProductReviewsSortBy> {
  productReviewRate?: number;
}
