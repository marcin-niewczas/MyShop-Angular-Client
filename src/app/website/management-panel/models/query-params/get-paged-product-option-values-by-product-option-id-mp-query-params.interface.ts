import { PaginationQueryParams } from '../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { SearchQueryParams } from '../../../../shared/models/requests/query-models/common/search-query-params.interface';

export interface GetPagedProductOptionValuesByProductOptionIdMpQueryParams
  extends PaginationQueryParams,
    SearchQueryParams {}