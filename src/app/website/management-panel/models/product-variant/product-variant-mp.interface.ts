import { OptionNameValueId } from '../../../../shared/models/option-name-value.interface';
import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';

export interface ProductVariantMp extends BaseIdTimestampResponse {
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly price: number;
  readonly skuId: number;
  readonly encodedName: string;
  readonly productVariantValues: readonly OptionNameValueId[];
  readonly variantLabel: string;
}
