import { BasePhoto } from '../../../../shared/components/photo/photo.component';
import { OptionNameValue } from '../../../../shared/models/option-name-value.interface';
import { DisplayProductType } from '../../../../shared/models/product/display-product-type.enum';

type AvailableOptionByMain = {
  readonly name: string;
  readonly variantValues: string[];
};
type AvailableOptionByAll = {
  readonly name: string;
  readonly variantValues: VariantBy<string>[];
};
type CurrentVariant = {
  readonly id: string;
  readonly price: number;
  readonly lastItemsInStock?: boolean;
  readonly variantValues: OptionNameValue[];
  readonly photos: BasePhoto[];
};

type VariantBy<T> = { readonly encodedName: string; readonly value: T };

export abstract class BaseProductDetailEc {
  readonly modelName!: string;
  readonly fullName!: string;
  readonly description?: string;
  readonly encodedProductName!: string;
  readonly categoryHierarchyName!: string;
  readonly categoryEncodedName!: string;
  readonly productId!: string;
  readonly displayProductPer!: DisplayProductType;
  productReviewsCount!: number;
  readonly sumProductReviewsRate!: number;
  readonly mainDetailOptions!: OptionNameValue;
  readonly additionalDetailOptions!: OptionNameValue[];
  avarageProductReviewsRate!: number;
  readonly photos!: BasePhoto[];
  readonly mainVariantOption!: OptionNameValue;
}

export abstract class ProductDetailByMainVariantEc extends BaseProductDetailEc {
  readonly minPrice!: number;
  readonly maxPrice!: number;
  readonly isStablePrice!: boolean;
  readonly currentVariants!: CurrentVariant[];
  readonly otherVariants!: VariantBy<OptionNameValue>[];
  readonly currentProductEncodedName!: string;
  readonly availableOptions!: AvailableOptionByMain[];
}

export abstract class ProductDetailByAllVariantsEc extends BaseProductDetailEc {
  readonly availableOptions!: AvailableOptionByAll[];
  readonly price!: number;
  readonly lastItemsInStock!: boolean;
  readonly additionalVariantOptions!: OptionNameValue[];
  readonly allCurrentVariantOptions!: OptionNameValue[];
  readonly productVariantId!: string;
  readonly allVariants!: VariantBy<OptionNameValue[]>[];
}
