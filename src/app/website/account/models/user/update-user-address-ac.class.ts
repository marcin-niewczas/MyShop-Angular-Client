import { CreateUserAddressAc } from './create-user-address-ac.class';

export class UpdateUserAddressAc extends CreateUserAddressAc {
  constructor(
    readonly id: string,
    override streetName: string,
    override buildingNumber: string,
    override city: string,
    override zipCode: string,
    override country: string,
    override userAddressName: string,
    override isDefault: boolean,
    override apartmentNumber?: string | null,
  ) {
    super(
      streetName,
      buildingNumber,
      city,
      zipCode,
      country,
      userAddressName,
      isDefault,
      apartmentNumber,
    );
  }
}
