import { ProductOptionSubtype } from '../../../../shared/models/product-option/product-option-subtype.enum';
import { ProductOptionType } from '../../../../shared/models/product-option/product-option-type.enum';
import { CategoryEc } from '../category/category-ec.interface';

export interface ProductFiltersEc {
  readonly category: CategoryEc;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly productOptions: ProductOptionEc[];
}

export interface ProductOptionEc {
  readonly name: string;
  readonly type: ProductOptionType;
  readonly subtype: ProductOptionSubtype;
  readonly values: ProductOptionValueEc[];
}

export interface ProductOptionValueEc {
  readonly id: string;
  readonly value: string;
  readonly count: number;
}
