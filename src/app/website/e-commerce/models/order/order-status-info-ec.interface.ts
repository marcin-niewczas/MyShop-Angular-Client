import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';
import { OrderStatus } from '../../../../shared/models/responses/order/order-status.enum';

export interface OrderStatusInfoEc extends BaseIdTimestampResponse {
  status: OrderStatus;
  readonly redirectPaymentUri: string;
}
