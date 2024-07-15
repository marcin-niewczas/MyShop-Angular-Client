import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';
import { ProductOptionMp } from '../product-option/product-option-mp.interface';

export interface ProductOptionValueMp extends BaseIdTimestampResponse {
  readonly value: string;
  readonly productVariantOptionMp: ProductOptionMp;
}
