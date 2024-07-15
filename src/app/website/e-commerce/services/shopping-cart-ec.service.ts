import { HttpClient } from '@angular/common/http';
import { UpdateShoppingCartItemEc } from '../models/shopping-cart/update-shopping-cart-item-ec.class';
import {
  ShoppingCartDetailEc,
  ShoppingCartItemChanges,
} from '../models/shopping-cart/shopping-cart-detail-ec.interface';
import {
  Observable,
  Subject,
  catchError,
  map,
  switchMap,
  throwError,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ShoppingCartItemErrorMaxQuantityEc } from '../models/shopping-cart/shopping-cart-item-error-max-quantity-ec.interface';
import { AuthService } from '../../authenticate/auth.service';
import {
  ECommerceRouteSection,
  ECommerceRouteService,
} from './ecommerce-route.service';
import { ShoppingCartItemDetailEc } from '../models/shopping-cart/shopping-cart-item-detail-ec.interface';
import { Injectable, inject, signal } from '@angular/core';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';

@Injectable()
export class ShoppingCartEcService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _authService = inject(AuthService);
  private readonly _eCommerceRouteService = inject(ECommerceRouteService);

  private readonly _fetchShoppingCartDetailSubject = new Subject<void>();

  private readonly _shoppingCartItems = signal<
    readonly ShoppingCartItemDetailEc[] | undefined
  >(undefined);
  readonly shoppingCartItems = this._shoppingCartItems.asReadonly();

  private readonly _totalPrice = signal<number | undefined>(undefined);
  readonly totalPrice = this._totalPrice.asReadonly();

  private readonly _totalQuantity = signal<number | undefined>(undefined);
  readonly totalQuantity = this._totalQuantity.asReadonly();

  readonly shoppingCartChanges = signal<ShoppingCartItemChanges | undefined>(
    undefined,
  );

  readonly shoppingCartOpened = signal(false);

  readonly isCheckoutProcess = signal(false);

  private readonly _isLoadingShoppingCartDetail = signal(false);
  readonly isLoadingShoppingCartDetail =
    this._isLoadingShoppingCartDetail.asReadonly();

  private readonly _getShopingCartDetail = toSignal(
    this._fetchShoppingCartDetailSubject.pipe(
      switchMap(() => this.verifyShoppingCart()),
    ),
  );

  private readonly baseUrl: string = `${this._enviromentService.apiEcommerceUrl}/shopping-carts/me`;

  verifyShoppingCart(notUpdateChanges?: boolean) {
    this._isLoadingShoppingCartDetail.set(true);
    return this._client
      .post<
        ApiResponse<ShoppingCartDetailEc>
      >(`${this.baseUrl}/verification`, undefined)
      .pipe(
        map((response) => {
          if (!notUpdateChanges) {
            this.shoppingCartChanges.update((current) => {
              if (current && response.data.changes) {
                Object.keys(response.data.changes).forEach(
                  (key) => (current[key] = response.data.changes![key]),
                );
                return current;
              }

              if (current && !response.data.changes) {
                return current;
              }

              return response.data.changes;
            });

            const currentRouteSection =
              this._eCommerceRouteService.currentRouteSection();

            if (
              response.data.changes &&
              currentRouteSection !== ECommerceRouteSection.OrderStepper
            ) {
              this.shoppingCartOpened.set(true);
            }
          }

          this._shoppingCartItems.set(response.data.shoppingCartItems);
          this._totalPrice.set(response.data.totalPrice);
          this._totalQuantity.set(response.data.totalQuantity);

          this._isLoadingShoppingCartDetail.set(false);

          return response.data;
        }),
      );
  }

  reloadShoppingCartDetail() {
    this._fetchShoppingCartDetailSubject.next();
  }

  create(productVariantId: string) {
    return (
      this._authService.hasGuestPermission()
        ? this._client
            .post(`${this.baseUrl}/shopping-cart-items`, {
              productVariantId: productVariantId,
            } as any)
            .pipe(map(() => undefined))
        : this._authService.signUpGuest().pipe(
            switchMap(() =>
              this._client
                .post(`${this.baseUrl}/shopping-cart-items`, {
                  productVariantId: productVariantId,
                } as any)
                .pipe(map(() => undefined)),
            ),
          )
    ).pipe(
      switchMap(() => this.verifyShoppingCart().pipe(map(() => undefined))),
      catchError((err) =>
        this.verifyShoppingCart().pipe(switchMap(() => throwError(() => err))),
      ),
    );
  }

  update(models: UpdateShoppingCartItemEc[]) {
    return this._client
      .put<
        ApiResponse<ShoppingCartItemErrorMaxQuantityEc>
      >(`${this.baseUrl}/shopping-cart-items`, models)
      .pipe(map((response) => response.data));
  }

  remove(shoppingCartItemId: string): Observable<void> {
    return this._client
      .delete(`${this.baseUrl}/shopping-cart-items/${shoppingCartItemId}`, {
        id: shoppingCartItemId,
      } as any)
      .pipe(map(() => undefined));
  }

  checkout() {
    return this._client.patch<ApiResponse<{ checkoutId: string }>>(
      `${this.baseUrl}/checkout`,
      undefined,
    );
  }

  clearData() {
    this._shoppingCartItems.set(undefined);
  }
}
