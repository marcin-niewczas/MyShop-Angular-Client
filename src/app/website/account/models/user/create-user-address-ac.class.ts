export class CreateUserAddressAc {
  constructor(
    readonly streetName: string,
    readonly buildingNumber: string,
    readonly city: string,
    readonly zipCode: string,
    readonly country: string,
    readonly userAddressName: string,
    readonly isDefault: boolean,
    readonly apartmentNumber?: string | null,
  ) {}
}
