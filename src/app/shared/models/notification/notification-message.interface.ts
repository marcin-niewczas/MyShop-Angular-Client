import { BaseIdTimestampResponse } from '../responses/base-response.interface';
import { NotificationType } from './notification-type.enum';

export interface NotificationMessage extends BaseIdTimestampResponse {
  isRead: boolean;
  readonly notificationType: NotificationType;
  readonly message: string;
  readonly resourceId: string;
}
