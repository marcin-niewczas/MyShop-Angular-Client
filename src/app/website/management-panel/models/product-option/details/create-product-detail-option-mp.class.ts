import { ProductOptionSortType } from '../../../../../shared/models/product-option/product-option-sort-type.enum';
import { ProductOptionSubtype } from '../../../../../shared/models/product-option/product-option-subtype.enum';

export class CreateProductDetailOptionMp {
  constructor(
    readonly name: string,
    readonly productOptionSubtype: ProductOptionSubtype,
    readonly productOptionSortType: ProductOptionSortType,
    readonly productDetailOptionValues: string[],
  ) {}
}
