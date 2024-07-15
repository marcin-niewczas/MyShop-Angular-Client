import { PhotoItem } from '../photo/photo-item.interface';
import { DisplayProductType } from './display-product-type.enum';

export interface ProductListItem {
  readonly minPrice: number;
  readonly maxPrice: number;
  readonly isStablePrice: boolean;
  readonly variantsCount: number;
  readonly isAvailable: boolean;
  readonly productData: ProductData;
  readonly productReviewsCount: number;
  readonly productReviewsRate: number;
}

export interface ProductData {
  readonly modelName: string;
  readonly fullName: string;
  readonly displayProductPer: DisplayProductType;
  readonly categoryHierarchyName: string;
  readonly encodedName: string;
  readonly mainVariantOptionValue: string;
  readonly mainPhoto?: PhotoItem;
  readonly variantLabel: string;
  readonly hasMultipleVariants: boolean;
  readonly productVariantId?: string;
}
