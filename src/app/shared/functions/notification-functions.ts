import { NotificationMessage } from '../models/notification/notification-message.interface';
import { NotificationType } from '../models/notification/notification-type.enum';

export function getNotificationIcon(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.Order:
      return 'shopping_bag';
    case NotificationType.ProductIsAvailable:
    case NotificationType.ProductPriceReduced:
      return 'favorite';
    case NotificationType.Security:
      return 'lock';
    default:
      return 'notifications';
  }
}

export function getNotificationTitle(notificationType: NotificationType) {
  switch (notificationType) {
    case NotificationType.Order:
      return 'Order';
    case NotificationType.ProductIsAvailable:
    case NotificationType.ProductPriceReduced:
      return 'Favorite';
    case NotificationType.Security:
      return 'Security';
    default:
      return '';
  }
}

export function getNotificationRouterLink(notification: NotificationMessage) {
  switch (notification.notificationType) {
    case NotificationType.Order:
      return ['/account', 'orders', notification.resourceId, 'details'];
    case NotificationType.ProductIsAvailable:
    case NotificationType.ProductPriceReduced:
      return ['/products', notification.resourceId];
    case NotificationType.Security:
      return ['/account', 'security'];
    default:
      return 'notifications';
  }
}
