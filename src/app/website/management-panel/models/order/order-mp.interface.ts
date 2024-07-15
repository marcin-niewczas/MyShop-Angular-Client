import { DeliveryMethod } from '../../../../shared/models/order/delivery-method.enum';
import { PaymentMethod } from '../../../../shared/models/order/payment-method.enum';
import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';
import { OrderStatus } from '../../../../shared/models/responses/order/order-status.enum';

export interface OrderMp extends BaseIdTimestampResponse {
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
  readonly status: OrderStatus;
}
