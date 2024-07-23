import { DeliveryMethod } from '../../../../shared/models/order/delivery-method.enum';
import { OrderStatusHistory } from '../../../../shared/models/order/order-status-history.interface';
import { PaymentMethod } from '../../../../shared/models/order/payment-method.enum';
import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';
import { OrderStatus } from '../../../../shared/models/order/order-status.enum';
import { User } from '../../../../shared/models/user/user.interface';
import { OrderProductMp } from './order-product-mp.interface';

export interface OrderDetailMp extends BaseIdTimestampResponse {
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
  readonly orderStatusHistories: readonly OrderStatusHistory[];
  readonly orderProducts: readonly OrderProductMp[];
  readonly user: User;
}
