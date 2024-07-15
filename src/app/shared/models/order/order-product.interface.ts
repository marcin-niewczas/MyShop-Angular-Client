import { OptionNameValue } from '../option-name-value.interface';
import { PhotoItem } from '../photo/photo-item.interface';

export interface OrderProduct {
  readonly name: string;
  readonly categoryHierarchyName: string;
  readonly encodedName: string;
  readonly mainPhoto: PhotoItem;
  readonly price: number;
  readonly priceAll: number;
  readonly quantity: number;
  readonly orderId: string;
  readonly variantOptionNameValues: OptionNameValue[];
}
