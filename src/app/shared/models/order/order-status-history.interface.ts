import { BaseIdTimestampResponse } from '../responses/base-response.interface';
import { OrderStatus } from './order-status.enum';

export interface OrderStatusHistory extends BaseIdTimestampResponse {
  readonly status: OrderStatus;
}
