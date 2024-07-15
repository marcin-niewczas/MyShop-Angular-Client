import { ProductOptionSortType } from '../../../../../shared/models/product-option/product-option-sort-type.enum';

export class UpdateProductVariantOptionMp {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly productOptionSortType: ProductOptionSortType,
  ) {}
}
