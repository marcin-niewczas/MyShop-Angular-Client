import { OrderStatus } from '../models/responses/order/order-status.enum';

export function getOrderStatusColorClass(status?: OrderStatus) {
  switch (status) {
    case OrderStatus.New:
    case OrderStatus.WaitingForPayment:
      return 'accent-color';
    case OrderStatus.PaymentReceived:
      return 'primary-color';
    case OrderStatus.Completed:
      return 'success-color';
    case OrderStatus.PaymentFailed:
      return 'warn-color';
    default:
      return 'custom-disabled-color';
  }
}

export function orderCanBeCancelled(status: OrderStatus) {
  switch (status) {
    case OrderStatus.New:
    case OrderStatus.WaitingForPayment:
      return true;
    default:
      return false;
  }
}

export function getOrderStatusIcon(status: OrderStatus) {
  switch (status) {
    case OrderStatus.New:
      return 'add';
    case OrderStatus.WaitingForPayment:
      return 'credit_card';
    case OrderStatus.PaymentReceived:
      return 'credit_score';
    case OrderStatus.PaymentFailed:
      return 'credit_card_off';
    case OrderStatus.Shipped:
      return 'local_shipping';
    case OrderStatus.Delivered:
      return 'inventory';
    case OrderStatus.Canceled:
      return 'cancel';
    case OrderStatus.Completed:
      return 'task_alt';
  }
}
