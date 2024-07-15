import { GetPagedNotificationsSortBy } from '../../../sort-by/get-paged-notifications-sort-by.enum';
import { PaginationQueryParams } from '../common/pagination-query-params.interface';
import { SortQueryParams } from '../common/sort-query-params.interface';
import { TimestampQueryParams } from '../common/timestamp-query-params.interface';

export interface GetPagedNotificationsQueryParams
  extends PaginationQueryParams,
    SortQueryParams<GetPagedNotificationsSortBy>,
    TimestampQueryParams {
  withUnreadNotificationCount: boolean;
}