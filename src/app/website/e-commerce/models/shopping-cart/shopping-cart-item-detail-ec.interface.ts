import { OptionNameValue } from '../../../../shared/models/option-name-value.interface';

export interface ShoppingCartItemDetailEc {
  shoppingCartItemId: string;
  encodedName: string;
  fullName: string;
  categoryHierarchyName: string;
  mainProductVariantOption: OptionNameValue;
  additionalProductVariantOptions: OptionNameValue[];
  photoUrl: string;
  photoAlt: string;
  quantity: number;
  pricePerEach: number;
  priceAll: number;
}
