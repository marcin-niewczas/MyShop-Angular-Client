import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';

export interface GetPagedMainPageSectionsEcQueryParams
  extends PaginationQueryParams {
  productCarouselItemsCount: number;
}
