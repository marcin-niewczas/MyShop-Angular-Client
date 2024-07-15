import { PaymentMethod } from './payment-method.enum';
import { OrderStatusHistory } from './order-status-history.interface';
import { BaseIdTimestampResponse } from '../responses/base-response.interface';
import { OrderStatus } from '../responses/order/order-status.enum';
import { OrderProduct } from './order-product.interface';
import { DeliveryMethod } from './delivery-method.enum';

export interface OrderWithProducts extends BaseIdTimestampResponse {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly streetName: string;
  readonly buildingNumber: string;
  readonly apartmentNumber?: string;
  readonly zipCode: string;
  readonly city: string;
  readonly country: string;
  readonly deliveryMethod: DeliveryMethod;
  readonly paymentMethod: PaymentMethod;
  readonly totalPrice: number;
  status: OrderStatus;
  readonly redirectPaymentUri: string;
  readonly orderProducts: OrderProduct[];
  readonly orderStatusHistories: readonly OrderStatusHistory[];
}
