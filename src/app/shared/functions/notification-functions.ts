import { NotificationMessage } from '../models/responses/notification/notification-message.interface';
import { NotificationType } from '../models/responses/notification/notification-type.enum';


export function getNotificationIcon(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.Order:
      return 'shopping_bag';
    case NotificationType.SalesEvent:
      return 'percent';
    case NotificationType.ProductFavoriteSale:
      return 'favorite';
    case NotificationType.Security:
      return 'lock';
    default:
      return 'notifications';
  }
}

export function getNotificationRouterLink(notification: NotificationMessage) {
  switch (notification.notificationType) {
    case NotificationType.Order:
      return ['/account', 'orders', notification.resourceId, 'details'];
    case NotificationType.SalesEvent:
      return [];
    case NotificationType.ProductFavoriteSale:
      return [];
    case NotificationType.Security:
      return ['/account', 'security'];
    default:
      return 'notifications';
  }
}
