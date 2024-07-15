import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';

export interface GetPagedProductPhotosByProductIdMpQueryParams
  extends PaginationQueryParams {
  expectProductVariantId?: string;
}