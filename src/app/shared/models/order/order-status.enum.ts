export enum OrderStatus {
    New = 'New',
    WaitingForPayment = 'Waiting For Payment',
    PaymentReceived = 'Payment Received',
    PaymentFailed = 'Payment Failed',
    Shipped = 'Shipped',
    Delivered = 'Delivered',
    Completed = 'Completed',
    Canceled = 'Canceled',
  }
  
  export const correctOrderStatusPaymentWay: readonly OrderStatus[] = [
    OrderStatus.New,
    OrderStatus.WaitingForPayment,
    OrderStatus.PaymentReceived,
    OrderStatus.Shipped,
    OrderStatus.Delivered,
    OrderStatus.Completed,
  ];
  
  export const failedOrderStatus: readonly OrderStatus[] = [OrderStatus.PaymentFailed];
  
  export const successOrderStatus: readonly OrderStatus[] = [
    OrderStatus.Completed,
    OrderStatus.Canceled,
  ];
  
  export const correctOrderStatusCashOnDeliveryWay: readonly OrderStatus[] = [
    OrderStatus.New,
    OrderStatus.Shipped,
    OrderStatus.Delivered,
    OrderStatus.Completed,
  ];