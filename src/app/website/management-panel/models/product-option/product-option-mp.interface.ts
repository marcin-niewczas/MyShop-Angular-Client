import { ProductOptionSortType } from '../../../../shared/models/product-option/product-option-sort-type.enum';
import { ProductOptionSubtype } from '../../../../shared/models/product-option/product-option-subtype.enum';
import { ProductOptionType } from '../../../../shared/models/product-option/product-option-type.enum';
import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';
import { ProductOptionValueMp } from '../product-option-value/product-option-value-mp.interface';

export interface ProductOptionMp extends BaseIdTimestampResponse {
    readonly name: string;
    readonly productOptionType: ProductOptionType;
    readonly productOptionSubtype: ProductOptionSubtype;
    readonly productOptionSortType: ProductOptionSortType;
    readonly productOptionValues: ProductOptionValueMp[];
  }