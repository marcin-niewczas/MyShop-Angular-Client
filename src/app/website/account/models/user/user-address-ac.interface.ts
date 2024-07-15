export interface UserAddressAc {
  id: string;
  streetName: string;
  buildingNumber: string;
  apartmentNumber?: string;
  city: string;
  zipCode: string;
  country: string;
  userAddressName: string;
  isDefault: boolean;
}
