import { ValuePosition } from '../../../../shared/models/helpers/value-position.interface';
import { DisplayProductType } from '../../../../shared/models/product/display-product-type.enum';

export class CreateProductMp {
  constructor(
    readonly name: string,
    readonly displayProductPer: DisplayProductType,
    readonly description: string | null | undefined,
    readonly productCategoryId: string,
    readonly chosenProductDetailOptionValues: ValuePosition<string>[],
    readonly chosenProductVariantOptions: ValuePosition<string>[],
  ) {}
}
