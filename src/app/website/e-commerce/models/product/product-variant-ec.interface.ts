export interface ProductVariantEc {
  readonly productVariantId: string;
  readonly variantLabel: string;
  readonly lastItemsInStock?: boolean;
  readonly price: number;
  isAddToShoppingCartProcess: boolean;
}
