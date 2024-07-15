import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Subject,
  Subscription,
  finalize,
  filter,
  switchMap,
  tap,
  catchError,
  of,
} from 'rxjs';
import {
  BaseProductDetailEc,
  ProductDetailByAllVariantsEc,
  ProductDetailByMainVariantEc,
} from '../models/product/product-detail-ec.interface';
import {
  CurrencyPipe,
  NgClass,
  NgTemplateOutlet,
  KeyValuePipe,
} from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { inAnimation } from '../../../shared/components/animations';
import { FavoriteNoAuthDialogComponent } from '../../../shared/components/favorite-no-auth-dialog/favorite-no-auth-dialog.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PhotoCarouselComponent } from '../../../shared/components/photo-carousel/photo-carousel.component';
import { BasePhoto } from '../../../shared/components/photo/photo.component';
import { SmallStarRatingComponent } from '../../../shared/components/small-star-rating/small-star-rating.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { getDeliveryIcon } from '../../../shared/functions/delivery-functions';
import { catchHttpError } from '../../../shared/helpers/pipe-helpers';
import { DeliveryMethod } from '../../../shared/models/order/delivery-method.enum';
import { DisplayProductType } from '../../../shared/models/product/display-product-type.enum';
import { ProductReviewRateStats } from '../../../shared/models/product/product-review-rate-stats.interface';
import { AccordionModule } from '../../../shared/modules/accordion/accordion.module';
import { BreakpointObserverService } from '../../../shared/services/breakpoint-observer.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../authenticate/auth.service';
import { ProductEcService } from '../services/product-ec.service';
import { ShoppingCartEcService } from '../services/shopping-cart-ec.service';
import { ProductDetailEcResolverData } from './ec-product-detail.resolver';
import { EcProductReviewsSidebarComponent } from './ec-product-reviews-sidebar/ec-product-reviews-sidebar.component';
import { EcProductVariantOptionsByAllVariantsComponent } from './ec-product-variant-options/ec-product-variant-options-by-all-variants/ec-product-variant-options-by-all-variants.component';
import { EcProductVariantOptionsByMainVariantComponent } from './ec-product-variant-options/ec-product-variant-options-by-main-variant/ec-product-variant-options-by-main-variant.component';

export type ChosenProductVariant = {
  id?: string;
  lastItemsInStock?: boolean;
  price?: number;
  photos?: BasePhoto[];
};

@Component({
  selector: 'app-ec-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    SmallStarRatingComponent,
    StarRatingComponent,
    EcProductReviewsSidebarComponent,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    SmallStarRatingComponent,
    AccordionModule,
    PhotoCarouselComponent,
    NgClass,
    EcProductVariantOptionsByAllVariantsComponent,
    EcProductVariantOptionsByMainVariantComponent,
    NgTemplateOutlet,
    KeyValuePipe,
    FaIconComponent,
    RouterLink,
    LoadingComponent,
    FavoriteNoAuthDialogComponent,
  ],
  templateUrl: './ec-product-detail.component.html',
  styleUrl: './ec-product-detail.component.scss',
  animations: [inAnimation],
})
export class EcProductDetailComponent implements OnInit, OnDestroy {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _shoppingCartEcService = inject(ShoppingCartEcService);
  private readonly _toastService = inject(ToastService);
  private readonly _authService = inject(AuthService);
  private readonly _productEcService = inject(ProductEcService);

  readonly chosenProductVariant = signal<ChosenProductVariant | undefined>(
    undefined,
  );

  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;
  readonly isMediumScreen = this._breakpointObserverService.isMediumScreen;
  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;

  readonly DeliveryMethod = DeliveryMethod;
  readonly getDeliveryIcon = getDeliveryIcon;

  private _isResetProductReviewSidebarComponentProcess = false;

  get isResetProductReviewSidebarComponentProcess() {
    return this._isResetProductReviewSidebarComponentProcess;
  }

  readonly productReviewsOpened = signal(false);

  readonly hasCustomerPermission = this._authService.hasCustomerPermission;

  private _activatedRouteDataSub?: Subscription;

  private _addItemToBasketSub?: Subscription;
  private readonly _addItemToBasketSubject = new Subject<string>();

  readonly isAddItemToBasketProcess = signal(false);

  productDetail!: ProductDetailByAllVariantsEc | ProductDetailByMainVariantEc;

  readonly isFavorite = signal<boolean | undefined>(undefined);

  readonly isToggleFavoriteProcess = signal(false);
  private _toggleFavoriteSub?: Subscription;
  private readonly _toggleFavoriteSubject = new Subject<{
    isFavorite: boolean;
  }>();

  ngOnInit(): void {
    this._activatedRouteDataSub = this._activatedRoute.data
      .pipe(
        tap(({ productDetailResolverData }) => {
          productDetailResolverData =
            productDetailResolverData as ProductDetailEcResolverData;

          this.chosenProductVariant.set(undefined);
          const detail = productDetailResolverData.productDetail as
            | ProductDetailByAllVariantsEc
            | ProductDetailByMainVariantEc;
          this.resetComponents(detail);
          this.isFavorite.set(productDetailResolverData.isFavorite);

          this.productDetail = detail;
        }),
      )
      .subscribe();

    this._addItemToBasketSub = this._addItemToBasketSubject
      .pipe(
        tap(() => this.isAddItemToBasketProcess.set(true)),
        switchMap((id) =>
          this._shoppingCartEcService.create(id).pipe(
            tap(() =>
              this._toastService.success(
                'The Product has been added to basket.',
              ),
            ),
            catchHttpError(this._toastService),
            finalize(() => this.isAddItemToBasketProcess.set(false)),
          ),
        ),
      )
      .subscribe();

    this._toggleFavoriteSub = this._toggleFavoriteSubject
      .pipe(
        filter(() => this.hasCustomerPermission() && !!this.productDetail),
        tap(() => this.isToggleFavoriteProcess.set(true)),
        switchMap(({ isFavorite }) =>
          (isFavorite
            ? this._productEcService
                .removeFavorite(this.productDetail.encodedProductName)
                .pipe(tap(() => this.isFavorite.set(false)))
            : this._productEcService
                .createFavorite(this.productDetail.encodedProductName)
                .pipe(tap(() => this.isFavorite.set(true)))
          ).pipe(
            catchError((error) => {
              if (
                error instanceof HttpErrorResponse &&
                error.status === HttpStatusCode.BadRequest
              ) {
                this.isFavorite.set(!this.isFavorite());
              }

              return of(error);
            }),
            finalize(() => this.isToggleFavoriteProcess.set(false)),
          ),
        ),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    if (this._activatedRouteDataSub) {
      this._activatedRouteDataSub.unsubscribe();
    }

    if (this._addItemToBasketSub) {
      this._addItemToBasketSub.unsubscribe();
    }

    if (this._toggleFavoriteSub) {
      this._toggleFavoriteSub.unsubscribe();
    }
  }

  onRateChange(productReviewRateStats: ProductReviewRateStats) {
    this.productDetail.productReviewsCount =
      productReviewRateStats.productReviewsCount;
    this.productDetail.avarageProductReviewsRate =
      productReviewRateStats.avarageProductReviews;
  }

  isProductDetailByAllVariants(
    productDetail: BaseProductDetailEc,
  ): productDetail is ProductDetailByAllVariantsEc {
    switch (productDetail.displayProductPer) {
      case DisplayProductType.AllVariantOptions:
        return true;
      case DisplayProductType.MainVariantOption:
        return false;
    }
  }

  private resetComponents(detail: BaseProductDetailEc) {
    let isInResetProcess = false;

    if (
      this.productDetail &&
      this.productDetail.productId !== detail.productId
    ) {
      this._isResetProductReviewSidebarComponentProcess = true;
      isInResetProcess = true;
    }

    if (isInResetProcess) {
      this._changeDetectorRef.detectChanges();
    }

    this._isResetProductReviewSidebarComponentProcess = false;
  }

  onAddProductVariantToCart() {
    const id = this.chosenProductVariant()?.id;

    if (id) {
      this._addItemToBasketSubject.next(id);
    }
  }

  onFavoriteClicked(isFavorite?: boolean) {
    if (typeof isFavorite === 'boolean') {
      this._toggleFavoriteSubject.next({ isFavorite });
    }
  }
}
