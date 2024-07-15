import { ProductOptionSubtype } from '../../../../../shared/models/product-option/product-option-subtype.enum';
import { BaseIdTimestampResponse } from '../../../../../shared/models/responses/base-response.interface';

export interface ProductDetailOptionOfProductMp
  extends BaseIdTimestampResponse {
  readonly productOptionId: string;
  readonly productOptionValueId: string;
  readonly name: string;
  readonly value: string;
  readonly productOptionSubtype: ProductOptionSubtype;
}
