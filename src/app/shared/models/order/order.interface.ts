import { BaseIdTimestampResponse } from '../responses/base-response.interface';
import { OrderStatus } from './order-status.enum';

export interface Order extends BaseIdTimestampResponse {
  readonly status: OrderStatus;
  readonly totalPrice: number;
}
