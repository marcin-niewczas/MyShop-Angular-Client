import { ProductOptionSubtype } from '../../../../../shared/models/product-option/product-option-subtype.enum';
import { BaseIdTimestampResponse } from '../../../../../shared/models/responses/base-response.interface';

export interface ProductVariantOptionOfProductMp extends BaseIdTimestampResponse {
    readonly productOptionId: string;
    readonly name: string;
    readonly productOptionSubtype: ProductOptionSubtype;
  }