import { DeliveryMethod } from '../../../../shared/models/order/delivery-method.enum';
import { PaymentMethod } from '../../../../shared/models/order/payment-method.enum';

export class CreateGuestOrderEc {
  constructor(
    readonly checkoutId: string,
    readonly email: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly phoneNumber: string,
    readonly streetName: string,
    readonly buildingNumber: string,
    readonly zipCode: string,
    readonly city: string,
    readonly country: string,
    readonly deliveryMethod: DeliveryMethod,
    readonly paymentMethod: PaymentMethod,
    readonly apartmentNumber?: string | null,
  ) {}
}

export class CreateAuthUserOrderEc {
  constructor(
    readonly checkoutId: string,
    readonly phoneNumber: string,
    readonly streetName: string,
    readonly buildingNumber: string,
    readonly zipCode: string,
    readonly city: string,
    readonly country: string,
    readonly deliveryMethod: DeliveryMethod,
    readonly paymentMethod: PaymentMethod,
    readonly apartmentNumber?: string | null,
  ) {}
}
