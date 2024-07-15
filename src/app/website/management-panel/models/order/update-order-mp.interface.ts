import { OrderStatus } from '../../../../shared/models/responses/order/order-status.enum';

export class UpdateOrderMp {
  constructor(
    readonly id: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly phoneNumber: string,
    readonly streetName: string,
    readonly buildingNumber: string,
    readonly zipCode: string,
    readonly city: string,
    readonly country: string,
    readonly orderStatus: OrderStatus,
    readonly apartmentNumber?: string | null,
  ) {}
}
