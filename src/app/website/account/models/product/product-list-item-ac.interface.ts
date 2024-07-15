import { ProductListItem } from '../../../../shared/models/product/product-list-item.interface';

export interface ProductListItemAc extends ProductListItem {
  isProcess: boolean;
}
