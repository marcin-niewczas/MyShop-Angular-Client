import { OptionNameValueId, OptionNameId } from '../../../../shared/models/option-name-value.interface';
import { DisplayProductType } from '../../../../shared/models/product/display-product-type.enum';
import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';
import { CategoryMp } from '../category/category-mp.interface';

export interface ProductMp extends BaseIdTimestampResponse {
    readonly name: string;
    readonly fullName: string;
    readonly displayProductType: DisplayProductType;
    readonly description?: string;
    readonly category: CategoryMp;
    readonly productDetailOptions: readonly OptionNameValueId[];
    readonly productVariantOptions: readonly OptionNameId[];
  }