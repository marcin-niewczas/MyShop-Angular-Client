import { DeliveryMethod } from '../../../../shared/models/order/delivery-method.enum';
import { PaymentMethod } from '../../../../shared/models/order/payment-method.enum';
import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';
import { OrderStatus } from '../../../../shared/models/order/order-status.enum';

export interface PagedOrderMp extends BaseIdTimestampResponse {
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
  readonly status: OrderStatus;
}
