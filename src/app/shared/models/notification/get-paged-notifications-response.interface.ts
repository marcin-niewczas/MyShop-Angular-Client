import { ApiPagedResponse } from '../responses/api-paged-response.interface';
import { NotificationMessage } from './notification-message.interface';

export interface GetPagedNotificationsResponse
  extends ApiPagedResponse<NotificationMessage> {
  readonly unreadNotificationCount?: number;
}
