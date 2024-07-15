import { OptionNameValue } from '../../../../shared/models/option-name-value.interface';
import { PhotoItem } from '../../../../shared/models/photo/photo-item.interface';
import { BaseIdResponse } from '../../../../shared/models/responses/base-response.interface';

export interface OrderProductMp extends BaseIdResponse {
  readonly productId: string;
  readonly productVariantId: string;
  readonly name: string;
  readonly categoryHierarchyName: string;
  readonly encodedName: string;
  readonly mainPhoto: PhotoItem;
  readonly price: number;
  readonly priceAll: number;
  readonly quantity: number;
  readonly orderId: string;
  readonly variantOptionNameValues: OptionNameValue[];
}
