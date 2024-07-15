import { ProductListItem } from '../../../../shared/models/product/product-list-item.interface';
import { ProductVariantEc } from './product-variant-ec.interface';

export interface ProductListItemEc extends ProductListItem {
  variants?: ProductVariantEc[];
  isAddToShoppingCartProcess: boolean;
}
