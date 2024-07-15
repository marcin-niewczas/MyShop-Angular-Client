import { OptionNameValueId } from '../../../../shared/models/option-name-value.interface';
import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';

export interface PagedProductVariantMp extends BaseIdTimestampResponse {
  readonly quantity: number;
  readonly price: number;
  readonly skuId: number;
  readonly encodedName: string;
  readonly productVariantValues: readonly OptionNameValueId[];
  readonly variantLabel: string;
}
