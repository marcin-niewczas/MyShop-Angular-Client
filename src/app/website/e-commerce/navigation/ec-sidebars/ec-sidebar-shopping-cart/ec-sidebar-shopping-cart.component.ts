import { Component, ViewChild, inject, signal } from '@angular/core';
import { CurrencyPipe, KeyValuePipe } from '@angular/common';

import { MatDividerModule } from '@angular/material/divider';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  RouterModule,
} from '@angular/router';
import { ShoppingCartItemDetailEc } from '../../../models/shopping-cart/shopping-cart-item-detail-ec.interface';
import {
  EMPTY,
  Subject,
  catchError,
  concatMap,
  delay,
  filter,
  finalize,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  inOutAnimation,
  inAnimation,
} from '../../../../../shared/components/animations';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../../../shared/components/photo/photo.component';
import { BaseNavCloseSidebar } from '../../../../../shared/components/sidebar/base-nav-close-sidebar.class';
import { SidebarComponent } from '../../../../../shared/components/sidebar/sidebar.component';
import { DebounceFunction } from '../../../../../shared/functions/debounce-function';
import { nameof } from '../../../../../shared/functions/helper-functions';
import { ApiService } from '../../../../../shared/services/api.service';
import { BreakpointObserverService } from '../../../../../shared/services/breakpoint-observer.service';
import { AuthService } from '../../../../authenticate/auth.service';
import { CategoryEc } from '../../../models/category/category-ec.interface';
import { ShoppingCartItemChanges } from '../../../models/shopping-cart/shopping-cart-detail-ec.interface';
import { ShoppingCartItemErrorMaxQuantityEc } from '../../../models/shopping-cart/shopping-cart-item-error-max-quantity-ec.interface';
import { UpdateShoppingCartItemEc } from '../../../models/shopping-cart/update-shopping-cart-item-ec.class';
import { CategoryEcService } from '../../../services/category-ec.service';
import { ShoppingCartEcService } from '../../../services/shopping-cart-ec.service';

@Component({
  selector: 'app-ec-sidebar-shopping-cart',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
    LoadingComponent,
    MatDividerModule,
    RouterModule,
    PhotoComponent,
    CurrencyPipe,
    KeyValuePipe,
  ],
  templateUrl: './ec-sidebar-shopping-cart.component.html',
  styleUrls: ['./ec-sidebar-shopping-cart.component.scss'],
  animations: [inOutAnimation, inAnimation],
})
export class EcSidebarShoppingCartComponent extends BaseNavCloseSidebar {
  private readonly _shoppingCartEcService = inject(ShoppingCartEcService);
  private readonly _authService = inject(AuthService);
  private readonly _categoryEcService = inject(CategoryEcService);

  readonly breakpointObserverService = inject(BreakpointObserverService);

  override readonly opened = this._shoppingCartEcService.shoppingCartOpened;

  readonly ObjectKeys = Object.keys;

  readonly maxShoppingCartItemQuantity =
    inject(ApiService).apiConfiguration.maxShoppingCartItemQuantity;

  readonly currentQuantityRecord = {} as Record<
    string,
    { currentQuantity: number; item: ShoppingCartItemDetailEc }
  >;
  itemErrorMaxQuantity: ShoppingCartItemErrorMaxQuantityEc = {};
  readonly itemErrorMaxQuantityCountMessage: Record<
    string,
    { maxQuantity: number; count: number }
  > = {};
  readonly isEmptyCurrentQuantityRecord = signal(true);

  readonly isUpdateProcess = signal(false);

  readonly shoppingCartItems = this._shoppingCartEcService.shoppingCartItems;
  readonly totalPrice = this._shoppingCartEcService.totalPrice;

  readonly isLoadingShoppingCartDetail =
    this._shoppingCartEcService.isLoadingShoppingCartDetail;

  private readonly _updateShoppingCartItemsSubject = new Subject<void>();
  private readonly _removeShoppingCartItemSubject = new Subject<string>();
  private readonly _displayMaxQuantityErrorMessageSubject = new Subject<{
    key: string;
    maxQuantity: number;
  }>();

  readonly currentRemoveShoppingCartItemId = signal<string | undefined>(
    undefined,
  );

  readonly isCheckoutProcess = this._shoppingCartEcService.isCheckoutProcess;

  readonly hasGuestPermission = this._authService.hasGuestPermission;

  readonly shoppingCartChanges =
    this._shoppingCartEcService.shoppingCartChanges;

  private readonly _updateShoppingCartItems = toSignal(
    this._updateShoppingCartItemsSubject.pipe(
      mergeMap(() => {
        const keys = Object.keys(this.currentQuantityRecord);
        if (keys.length <= 0) {
          return EMPTY;
        }

        this.isUpdateProcess.set(true);

        const models = [] as UpdateShoppingCartItemEc[];

        keys.forEach((key) => {
          models.push(
            new UpdateShoppingCartItemEc(
              key,
              this.currentQuantityRecord[key].currentQuantity,
            ),
          );
        });

        return this._shoppingCartEcService.update(models).pipe(
          switchMap((response) => {
            return this._shoppingCartEcService.verifyShoppingCart(true).pipe(
              tap((detail) => {
                const errorMaxQuantityResponse = response;
                const itemErrorMaxQuantityKeys = Object.keys(
                  errorMaxQuantityResponse,
                );

                if (!detail.changes) {
                  this.itemErrorMaxQuantity = response;

                  itemErrorMaxQuantityKeys.forEach((key) =>
                    this._displayMaxQuantityErrorMessageSubject.next({
                      key,
                      maxQuantity: response[key],
                    }),
                  );
                } else {
                  this.shoppingCartChanges.update((current) => {
                    if (current && detail.changes) {
                      itemErrorMaxQuantityKeys.forEach(
                        (key) =>
                          (current[key] = {
                            productName: '',
                            from: 0,
                            to: 0,
                            maxLimit: errorMaxQuantityResponse[key],
                          }),
                      );
                      this.ObjectKeys(detail.changes).forEach(
                        (key) => (current[key] = detail.changes![key]),
                      );
                      return current;
                    }

                    if (detail.changes) {
                      const shoppingCartChanges = {} as ShoppingCartItemChanges;

                      const detailChangesKeys = this.ObjectKeys(detail.changes);

                      itemErrorMaxQuantityKeys
                        .filter((key) => detailChangesKeys.includes(key))
                        .forEach((key) => delete errorMaxQuantityResponse[key]);

                      itemErrorMaxQuantityKeys.forEach((key) => {
                        const product = detail.shoppingCartItems.find(
                          (i) => i.shoppingCartItemId === key,
                        );
                        if (product) {
                          shoppingCartChanges[key] = {
                            productName:
                              this.getProductNameForShoppingCartChanges(
                                product,
                              ),
                            from: 0,
                            to: 0,
                            maxLimit: errorMaxQuantityResponse[key],
                          };
                        }
                      });

                      this.ObjectKeys(detail.changes).forEach(
                        (key) =>
                          (shoppingCartChanges[key] = detail.changes![key]),
                      );

                      return shoppingCartChanges;
                    }

                    return undefined;
                  });
                }
              }),
            );
          }),
          catchError(() => this._shoppingCartEcService.verifyShoppingCart()),
          finalize(() => {
            this.isUpdateProcess.set(false);
            keys.forEach((key) => {
              delete this.currentQuantityRecord[key];
            });
            this.isEmptyCurrentQuantityRecord.set(true);
          }),
        );
      }),

      catchError((error) => of(error)),
    ),
  );

  private readonly __displayMaxQuantityErrorMessage = toSignal(
    this._displayMaxQuantityErrorMessageSubject.pipe(
      map((value) => {
        if (this.itemErrorMaxQuantityCountMessage[value.key] === undefined) {
          this.itemErrorMaxQuantityCountMessage[value.key] = {
            maxQuantity: value.maxQuantity,
            count: 1,
          };
        } else {
          this.itemErrorMaxQuantityCountMessage[value.key].count += 1;
          this.itemErrorMaxQuantityCountMessage[value.key].maxQuantity =
            value.maxQuantity;
        }
        return value.key;
      }),
      delay(5000),
      tap((key) => {
        if (this.itemErrorMaxQuantityCountMessage[key].count <= 1) {
          delete this.itemErrorMaxQuantity[key];
          delete this.itemErrorMaxQuantityCountMessage[key];
        } else {
          this.itemErrorMaxQuantityCountMessage[key].count -= 1;
        }
      }),
    ),
  );

  private readonly _removeShoppingCartItem = toSignal(
    this._removeShoppingCartItemSubject.pipe(
      tap((shoppingCartItemId) => {
        this.currentRemoveShoppingCartItemId.set(shoppingCartItemId);
      }),
      concatMap((shoppingCartItemId) =>
        this._shoppingCartEcService.remove(shoppingCartItemId).pipe(
          switchMap(() => this._shoppingCartEcService.verifyShoppingCart()),
          catchError((error) => of(error)),
          finalize(() => {
            this.currentRemoveShoppingCartItemId.set(undefined);
          }),
        ),
      ),
    ),
  );

  readonly categories = this._categoryEcService.categories;

  get isAuthenticated() {
    return this._authService.isAuthenticated;
  }

  addItem(item: ShoppingCartItemDetailEc) {
    if (
      this.currentQuantityRecord[item.shoppingCartItemId]?.currentQuantity +
        1 ===
      item.quantity
    ) {
      delete this.currentQuantityRecord[item.shoppingCartItemId];

      if (Object.keys(this.currentQuantityRecord).length <= 0) {
        this.isEmptyCurrentQuantityRecord.set(true);
      } else {
        this.isEmptyCurrentQuantityRecord.set(false);
      }

      return;
    }

    if (this.currentQuantityRecord[item.shoppingCartItemId] === undefined) {
      this.currentQuantityRecord[item.shoppingCartItemId] = {
        currentQuantity: item.quantity,
        item,
      };
    }

    this.currentQuantityRecord[item.shoppingCartItemId].currentQuantity += 1;

    if (Object.keys(this.currentQuantityRecord).length <= 0) {
      this.isEmptyCurrentQuantityRecord.set(true);
    } else {
      this.isEmptyCurrentQuantityRecord.set(false);
    }

    this.emitUpdateShoppingCartItems();
  }

  @DebounceFunction(500)
  private emitUpdateShoppingCartItems() {
    this._updateShoppingCartItemsSubject.next();
  }

  removeItem(shoppingCartItemId: string) {
    this._removeShoppingCartItemSubject.next(shoppingCartItemId);
  }

  subtractItem(item: ShoppingCartItemDetailEc) {
    if (
      this.currentQuantityRecord[item.shoppingCartItemId] &&
      this.currentQuantityRecord[item.shoppingCartItemId].currentQuantity -
        1 ===
        item.quantity
    ) {
      delete this.currentQuantityRecord[item.shoppingCartItemId];

      if (Object.keys(this.currentQuantityRecord).length <= 0) {
        this.isEmptyCurrentQuantityRecord.set(true);
      } else {
        this.isEmptyCurrentQuantityRecord.set(false);
      }

      return;
    }

    if (this.currentQuantityRecord[item.shoppingCartItemId] === undefined) {
      this.currentQuantityRecord[item.shoppingCartItemId] = {
        currentQuantity: item.quantity,
        item,
      };
    }

    this.currentQuantityRecord[item.shoppingCartItemId].currentQuantity -= 1;

    if (Object.keys(this.currentQuantityRecord).length <= 0) {
      this.isEmptyCurrentQuantityRecord.set(true);
    } else {
      this.isEmptyCurrentQuantityRecord.set(false);
    }

    this.emitUpdateShoppingCartItems();
  }

  clickNavItem(item: ShoppingCartItemDetailEc | CategoryEc) {
    if (this.isCategoryEc(item)) {
      this._router.url === `/categories/${item.encodedHierarchyName}` &&
        this.opened.set(false);

      return;
    }

    if (this._router.url === `/products/${item.encodedName}`) {
      this.opened.set(false);
      return;
    }

    this.clickedNavItemSubject.next();
  }

  private isCategoryEc(value: any): value is CategoryEc {
    return nameof<CategoryEc>('isRoot') in value;
  }

  private getProductNameForShoppingCartChanges(
    product: ShoppingCartItemDetailEc,
  ) {
    if (
      product.additionalProductVariantOptions &&
      product.additionalProductVariantOptions.length === 1
    ) {
      return `${product.fullName} ${product.additionalProductVariantOptions[0].value} (${product.mainProductVariantOption.value})`;
    }

    if (
      product.additionalProductVariantOptions &&
      product.additionalProductVariantOptions.length > 1
    ) {
      return `${product.fullName} ${product.additionalProductVariantOptions.map((v) => v.value).join('/')} (${product.mainProductVariantOption.value})`;
    }

    return `${product.fullName} (${product.mainProductVariantOption.value})`;
  }
}
