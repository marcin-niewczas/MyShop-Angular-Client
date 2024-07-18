import { ProductOptionType } from '../../../shared/models/product-option/product-option-type.enum';
import { DisplayProductType } from '../../../shared/models/product/display-product-type.enum';

export function getProductOptionTypeDescription(
  productOptionType: string | null | undefined,
) {
  switch (productOptionType) {
    case ProductOptionType.Variant:
      return 'The Product Variant Option Type is feature that distinguishes the variants of the product.';
    case ProductOptionType.Detail:
      return 'The Product Detail Option Type is common feature for all variants of the product.';
    default:
      return '';
  }
}

export function getDisplayProductTypeDescription(
    productOptionType: string | null | undefined,
  ) {
    switch (productOptionType) {
      case DisplayProductType.AllVariantOptions:
        return 'The All Variant Option Type group all product variants by all variant options. Every variants of product have a unique URL. You can often find it in online electronics stores.';
      case DisplayProductType.MainVariantOption:
        return 'The Main Variant Option Type group all product variants by main variant options. You can often find it in online clothing stores.';
      default:
        return '';
    }
  }
