import { ShoppingCartItemDetailEc } from './shopping-cart-item-detail-ec.interface';

export type ShoppingCartItemChange = {
  from: number;
  to: number;
  productName: string;
  maxLimit?: number;
};
export type ShoppingCartItemChanges = { [key: string]: ShoppingCartItemChange };

export interface ShoppingCartDetailEc {
  readonly totalQuantity: number;
  readonly totalPrice: number;
  readonly shoppingCartItems: ShoppingCartItemDetailEc[];
  changes?: ShoppingCartItemChanges;
}
