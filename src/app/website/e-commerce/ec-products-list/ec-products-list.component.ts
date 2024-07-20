import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Event,
  ParamMap,
  Router,
  RouterLink,
  Scroll,
} from '@angular/router';
import {
  Subject,
  catchError,
  concatMap,
  debounceTime,
  filter,
  finalize,
  forkJoin,
  fromEvent,
  map,
  mergeMap,
  of,
  skip,
  switchMap,
  tap,
  zip,
} from 'rxjs';
import {
  CurrentOptions,
  ProductsListResolvedData,
} from './ec-product-list.resolver';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CurrencyPipe,
  KeyValuePipe,
  NgClass,
  NgTemplateOutlet,
  ViewportScroller,
} from '@angular/common';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { GetPagedProductsEcSortBy } from '../models/query-sort-by/get-paged-products-ec-sort-by.enum';
import { GetPagedProductsEcQueryParams } from '../models/query-params/get-paged-products-ec-query-params.interface';
import { MatDividerModule } from '@angular/material/divider';
import { AccordionOpenedEcService } from './accordion-opened-ec.service';
import { MatSliderModule } from '@angular/material/slider';
import { GetProductFiltersByCategoryIdEcQueryParams } from '../models/query-params/get-product-filters-by-category-id-ec-query-params.interface';
import { ProductFiltersEc } from '../models/product/product-filters-ec.interface';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ProductOptionSubtype } from '../../../shared/models/product-option/product-option-subtype.enum';
import { ProductEcService } from '../services/product-ec.service';
import { CategoryEcService } from '../services/category-ec.service';
import { ProductListItemEc } from '../models/product/product-list-item-ec.interface';
import { MatBadgeModule } from '@angular/material/badge';

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { DisplayProductType } from '../../../shared/models/product/display-product-type.enum';
import { AuthService } from '../../authenticate/auth.service';
import { FavoriteEcService } from '../services/favorite-ec.service';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  expandCollapseAnimation,
  inOutAnimation,
  rotateIconAnimation,
  inAnimation,
  expandTransitionAnimation,
  skipFirstAnimation,
} from '../../../shared/components/animations';
import { FavoriteNoAuthDialogComponent } from '../../../shared/components/favorite-no-auth-dialog/favorite-no-auth-dialog.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../shared/components/photo/photo.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { isInEnum, nameof } from '../../../shared/functions/helper-functions';
import { catchHttpError } from '../../../shared/helpers/pipe-helpers';
import { StringJoinPipe } from '../../../shared/pipes/string-join.pipe';
import { TitleCaseFromStringPipe } from '../../../shared/pipes/title-case-from-enum-key.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { ProductVariantEc } from '../models/product/product-variant-ec.interface';
import { ShoppingCartEcService } from '../services/shopping-cart-ec.service';
import { ShowHideScrollToolbarDirective } from '../../../shared/directives/show-hide-scroll-toolbar.directive';
import { smoothScrollToTop } from '../../../shared/functions/scroll-functions';
import { SplitPipe } from '../../../shared/pipes/split.pipe';
import { BreakpointObserverService } from '../../../shared/services/breakpoint-observer.service';
import { EcMobileQuickAddProductSidebarComponent } from './ec-mobile-quick-add-product-sidebar/ec-mobile-quick-add-product-sidebar.component';

const animationDesktopFilterSidebarDuration = 300;

@Component({
  selector: 'app-ec-products-list',
  standalone: true,
  imports: [
    ShowHideScrollToolbarDirective,
    MatButtonModule,
    MatIconModule,
    SplitPipe,
    NgTemplateOutlet,
    SidebarComponent,
    MatRadioModule,
    RouterLink,
    FormsModule,
    KeyValuePipe,
    MatDividerModule,
    TitleCaseFromStringPipe,
    CurrencyPipe,
    MatSliderModule,
    MatCheckboxModule,
    StringJoinPipe,
    MatBadgeModule,
    MatPaginatorModule,
    PhotoComponent,
    RouterLink,
    StarRatingComponent,
    TitleCaseFromStringPipe,
    NgClass,
    EcMobileQuickAddProductSidebarComponent,
    LoadingComponent,
    MatRippleModule,
    FavoriteNoAuthDialogComponent,
  ],
  templateUrl: './ec-products-list.component.html',
  styleUrl: './ec-products-list.component.scss',
  animations: [
    expandCollapseAnimation,
    expandTransitionAnimation,
    inOutAnimation,
    rotateIconAnimation,
    inAnimation,
    skipFirstAnimation,
    trigger('expandCollapseWidth', [
      state(
        'expanded',
        style({ transform: 'translateX(0)', maxWidth: '*', minWidth: '*' }),
      ),
      state(
        'collapsed',
        style({ transform: 'translateX(-150%)', maxWidth: '0', minWidth: '0' }),
      ),
      transition(
        'expanded <=> collapsed',
        animate(`${animationDesktopFilterSidebarDuration}ms ease-in-out`),
      ),
    ]),
    trigger('resizeDesktopSidebar', [
      state('expanded', style({ height: 'calc(100vh - 74px)' })),
      state('collapsed', style({ height: 'calc(100vh - 138px)' })),
      transition('expanded <=> collapsed', animate('.3s')),
    ]),
  ],
})
export class EcProductsListComponent implements OnInit {
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _accordionOpenedEcService = inject(AccordionOpenedEcService);
  private readonly _categoryEcService = inject(CategoryEcService);
  private readonly _productEcService = inject(ProductEcService);
  private readonly _shoppingCartEcService = inject(ShoppingCartEcService);
  private readonly _viewportScroller = inject(ViewportScroller);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _toastService = inject(ToastService);
  private readonly _favoriteEcService = inject(FavoriteEcService);

  readonly hasCustomerPermission = inject(AuthService).hasCustomerPermission;

  readonly isXLargeScreen = this._breakpointObserverService.isXLargeScreen;
  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;
  readonly isMediumScreen = this._breakpointObserverService.isMediumScreen;
  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;
  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;

  readonly openedMobileFiltersSidebar = signal(false);
  readonly openedDesktopFiltersSidebar = signal(true);

  readonly productFilters = signal<ProductFiltersEc | undefined>(undefined);
  readonly products = signal<ProductListItemEc[] | undefined>(undefined);
  readonly productsTotalCount = signal<number | undefined>(undefined);

  readonly smoothScrollToTop = smoothScrollToTop;

  readonly Object = Object;

  readonly GetPagedProductsEcSortBy = GetPagedProductsEcSortBy;
  readonly ProductOptionSubtype = ProductOptionSubtype;
  readonly DisplayProductPer = DisplayProductType;

  readonly currentChosenProduct = signal<ProductListItemEc | undefined>(
    undefined,
  );

  private readonly _variantsLoader = toSignal(
    toObservable(this.currentChosenProduct).pipe(
      filter(
        (value): value is ProductListItemEc =>
          !!value &&
          value.variants == undefined &&
          value.productData.displayProductPer ===
            DisplayProductType.MainVariantOption,
      ),
      debounceTime(100),
      mergeMap((value) =>
        this._productEcService
          .getProductVariants(value?.productData.encodedName)
          .pipe(tap((response) => (value.variants = [...response.data]))),
      ),
    ),
  );

  private readonly _addToShoppingBasketSubject = new Subject<
    ProductListItemEc | ProductVariantEc
  >();

  private readonly _addToShoppingBasketTask = toSignal(
    this._addToShoppingBasketSubject.pipe(
      tap((model) => (model.isAddToShoppingCartProcess = true)),
      mergeMap((model) =>
        this._shoppingCartEcService
          .create(
            this.isProductVariantEc(model)
              ? model.productVariantId
              : model.productData.productVariantId!,
          )
          .pipe(
            tap(() =>
              this._toastService.success(
                'The Product has been added to basket.',
              ),
            ),
            catchHttpError(this._toastService),
            finalize(() => (model.isAddToShoppingCartProcess = false)),
          ),
      ),
    ),
  );

  readonly getPagedProductsEcQueryParams: GetPagedProductsEcQueryParams = {
    pageNumber: 1,
    pageSize: this._productEcService.minPageSize,
    sortBy: this._productEcService.defaultSortBy,
  };

  readonly getProductFiltersByCategoryIdEcQueryParams: GetProductFiltersByCategoryIdEcQueryParams =
    {};

  readonly isLoadData = signal(false);

  get allowedPageSize() {
    return this._productEcService.availablePageSizes;
  }

  readonly windowScrollY = toSignal(
    fromEvent(window, 'scroll').pipe(map(() => window.scrollY)),
    { initialValue: 0 },
  );

  currentOptions: CurrentOptions = {};

  readonly appliedSortAndFiltersCount = signal<number | undefined>(undefined);

  get sortByAccordionOpened() {
    return this._accordionOpenedEcService.sortByAccordionOpened;
  }

  get priceAccordionOpened() {
    return this._accordionOpenedEcService.priceAccordionOpened;
  }

  private readonly _initScrollSubject = new Subject<void>();
  private readonly _initScroll = toSignal(
    zip([
      this._router.events.pipe(
        filter((event: Event): event is Scroll => event instanceof Scroll),
      ),
      this._initScrollSubject,
    ]).pipe(
      tap(([scrollEvent]) => {
        this._changeDetectorRef.detectChanges();
        if (scrollEvent.position) {
          this._viewportScroller.scrollToPosition(scrollEvent.position);
        }
      }),
    ),
  );

  favoriteDictionary: Record<
    string,
    { isFavorite: boolean; isProcess: boolean }
  > = {};

  private readonly _toggleFavoriteSubject = new Subject<string>();

  private readonly _toggleFavoriteTask = toSignal(
    this._toggleFavoriteSubject.pipe(
      debounceTime(200),
      tap(
        (encodedName) =>
          (this.favoriteDictionary[encodedName].isProcess = true),
      ),
      switchMap((encodedName) =>
        (this.favoriteDictionary[encodedName].isFavorite
          ? this._productEcService.removeFavorite(encodedName)
          : this._productEcService.createFavorite(encodedName)
        ).pipe(
          tap(
            () =>
              (this.favoriteDictionary[encodedName].isFavorite =
                !this.favoriteDictionary[encodedName].isFavorite),
          ),
          catchError((error) => {
            if (
              error instanceof HttpErrorResponse &&
              error.status === HttpStatusCode.BadRequest
            ) {
              this.favoriteDictionary[encodedName].isFavorite =
                !this.favoriteDictionary[encodedName].isFavorite;
            }

            return of(error);
          }),
          finalize(
            () => (this.favoriteDictionary[encodedName].isProcess = false),
          ),
        ),
      ),
    ),
  );

  private readonly _loader = toSignal(
    this._activatedRoute.data.pipe(
      map(({ productListResolvedData }) => {
        const data = productListResolvedData as ProductsListResolvedData;

        if (data.favorites) {
          Object.keys(data.favorites).map(
            (key) =>
              (this.favoriteDictionary[key] = {
                isFavorite: data.favorites![key],
                isProcess: false,
              }),
          );
        } else {
          this.favoriteDictionary = {};
        }

        this.productFilters.set(data.productFilters);
        this.products.set(data.productListResponse.data);

        this.productsTotalCount.set(data.productListResponse.totalCount);
        this.getPagedProductsEcQueryParams.pageNumber =
          data.productListResponse.pageNumber;
        this.getPagedProductsEcQueryParams.pageSize =
          data.productListResponse.pageSize;
        this.getPagedProductsEcQueryParams.minPrice = data.currentMinPrice;
        this.getPagedProductsEcQueryParams.maxPrice = data.currentMaxPrice;
        this.getProductFiltersByCategoryIdEcQueryParams.minPrice =
          data.currentMinPrice;
        this.getProductFiltersByCategoryIdEcQueryParams.maxPrice =
          data.currentMaxPrice;
        this.getPagedProductsEcQueryParams.sortBy = data.currentSortBy;
        this.getPagedProductsEcQueryParams.encodedCategoryName =
          data.productFilters.category.encodedHierarchyName;

        if (data.currentOptions) {
          this.currentOptions = data.currentOptions;
        } else {
          this.currentOptions = {};
        }

        this.setAppliedSortAndFiltersCount(
          this._activatedRoute.snapshot.queryParamMap,
        );
        this._initScrollSubject.next();
      }),
      switchMap(() =>
        zip([
          this._activatedRoute.queryParamMap,
          this._router.events.pipe(
            filter((event: Event): event is Scroll => event instanceof Scroll),
          ),
        ]).pipe(
          skip(1),
          debounceTime(200),
          concatMap(([queryParamMap, scrollEvent]) => {
            this.isLoadData.set(true);
            let changeCount = 0;

            this.setPageNumber(queryParamMap);
            this.setPageSize(queryParamMap);
            this.setSortByChange(queryParamMap);

            changeCount += this.setAndCheckMinPriceChange(queryParamMap)
              ? 1
              : 0;
            changeCount += this.setAndCheckMaxPriceChange(queryParamMap)
              ? 1
              : 0;
            changeCount += this.setAndCheckProductOptionsChange(queryParamMap)
              ? 1
              : 0;

            return changeCount > 0
              ? forkJoin([
                  this._categoryEcService.getProductFiltersByEncodedCategoryName(
                    this.productFilters()?.category.encodedHierarchyName!,
                    this.getProductFiltersByCategoryIdEcQueryParams,
                  ),
                  this._productEcService
                    .getPagedProductListItems(
                      this.getPagedProductsEcQueryParams,
                    )
                    .pipe(
                      switchMap((productListResponse) =>
                        this.hasCustomerPermission() &&
                        productListResponse.data.length > 0
                          ? this._favoriteEcService
                              .getStatusOfFavorites(
                                productListResponse.data.map(
                                  (i) => i.productData.encodedName,
                                ),
                              )
                              .pipe(
                                map((favoriteResponse) => {
                                  this.favoriteDictionary = {};
                                  Object.keys(favoriteResponse.data).map(
                                    (key) =>
                                      (this.favoriteDictionary[key] = {
                                        isFavorite: favoriteResponse.data[key],
                                        isProcess: false,
                                      }),
                                  );
                                  return productListResponse;
                                }),
                              )
                          : of(productListResponse),
                      ),
                    ),
                ]).pipe(
                  tap(([filterResponse, productResponse]) => {
                    this.productFilters.set(filterResponse.data);
                    this.products.set(productResponse.data);
                    this.productsTotalCount.set(productResponse.totalCount);
                    this.setAppliedSortAndFiltersCount(queryParamMap);

                    this._changeDetectorRef.detectChanges();

                    if (scrollEvent.position) {
                      this._viewportScroller.scrollToPosition(
                        scrollEvent.position,
                      );
                    }
                  }),
                  finalize(() => this.isLoadData.set(false)),
                )
              : this._productEcService
                  .getPagedProductListItems(this.getPagedProductsEcQueryParams)
                  .pipe(
                    switchMap((productListResponse) =>
                      (this.hasCustomerPermission() &&
                      productListResponse.data.length > 0
                        ? this._favoriteEcService
                            .getStatusOfFavorites(
                              productListResponse.data.map(
                                (i) => i.productData.encodedName,
                              ),
                            )
                            .pipe(
                              map((favoriteResponse) => {
                                this.favoriteDictionary = {};
                                Object.keys(favoriteResponse.data).map(
                                  (key) =>
                                    (this.favoriteDictionary[key] = {
                                      isFavorite: favoriteResponse.data[key],
                                      isProcess: false,
                                    }),
                                );
                                return productListResponse;
                              }),
                            )
                        : of(productListResponse)
                      ).pipe(
                        tap((productResponse) => {
                          this.products.set(productResponse.data);
                          this.productsTotalCount.set(
                            productResponse.totalCount,
                          );
                          this.setAppliedSortAndFiltersCount(queryParamMap);

                          this._changeDetectorRef.detectChanges();

                          if (scrollEvent.position) {
                            this._viewportScroller.scrollToPosition(
                              scrollEvent.position,
                            );
                          }
                        }),
                      ),
                    ),

                    finalize(() => this.isLoadData.set(false)),
                  );
          }),
        ),
      ),
    ),
  );

  ngOnInit(): void {
    this.openedDesktopFiltersSidebar.set(this.getDesktopFiltersSidebarState());
  }

  toggleMobileFiltersSidebar() {
    this.openedMobileFiltersSidebar.set(true);
  }

  blockToolbar = false;

  toggleDesktopFiltersSidebar() {
    this.blockToolbar = true;
    let previousState = this.openedDesktopFiltersSidebar();
    this.openedDesktopFiltersSidebar.set(!this.openedDesktopFiltersSidebar());
    this.setDesktopFiltersSidebarState();

    setTimeout(() => {
      if (previousState !== this.openedDesktopFiltersSidebar()) {
        this.blockToolbar = false;
      }
    }, animationDesktopFilterSidebarDuration);
  }

  private readonly _desktopFiltersOpenedStateKey =
    'e-commerce-products-list-desktop-opened-desktop-filters-sidebar';

  private setDesktopFiltersSidebarState() {
    localStorage.setItem(
      this._desktopFiltersOpenedStateKey,
      JSON.stringify(this.openedDesktopFiltersSidebar()),
    );
  }

  private getDesktopFiltersSidebarState() {
    const value = localStorage.getItem(this._desktopFiltersOpenedStateKey);

    if (value === 'false') {
      return false;
    }

    return true;
  }

  readonly toggleAccordion = this._accordionOpenedEcService.toggle;

  toggleSortByAccordion() {
    this._accordionOpenedEcService.toggleSortBy();
  }

  togglePriceAccordion() {
    this._accordionOpenedEcService.togglePrice();
  }

  isProductOptionAccordionOpened(key: string) {
    return this._accordionOpenedEcService.accordionOpened[key];
  }

  toggleProductOptionAccordion(key: string) {
    this._accordionOpenedEcService.toggle(key);
  }

  optionValueChecked(optionName: string, value: string) {
    return this.currentOptions[optionName]?.includes(value);
  }

  onSortByChange(matRadioChange: MatRadioChange) {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    if (matRadioChange.value === GetPagedProductsEcSortBy.Newest) {
      delete queryParams['SortBy'];
    } else {
      queryParams['SortBy'] = matRadioChange.value;
    }

    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: queryParams,
    });
  }

  onProductOptionChange(optionName: string, value: string, checked: boolean) {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    const queryString = queryParams[optionName] as string | undefined;

    if (!queryString && checked) {
      queryParams[optionName] = value;
    }

    if (queryString && checked) {
      const splittedQueryString = queryString.split(',');

      if (splittedQueryString.length > 1) {
        queryParams[optionName] =
          `${queryString.slice(0, queryString.length - 1)},${value})`;
      }

      if (splittedQueryString.length === 1) {
        queryParams[optionName] = `(${queryString},${value})`;
      }
    }

    if (queryString && !checked) {
      const splittedQueryString = queryString.split(',');

      if (splittedQueryString.length > 1) {
        const firstElement = splittedQueryString[0];
        splittedQueryString[0] = firstElement.slice(1, firstElement.length);

        const lastElement = splittedQueryString[splittedQueryString.length - 1];
        splittedQueryString[splittedQueryString.length - 1] = lastElement.slice(
          0,
          lastElement.length - 1,
        );

        const index = splittedQueryString.findIndex((s) => s === value);

        splittedQueryString.splice(index, 1);

        if (splittedQueryString.length === 1) {
          queryParams[optionName] = `${splittedQueryString[0]}`;
        } else {
          queryParams[optionName] = `(${splittedQueryString.join(',')})`;
        }
      } else if (splittedQueryString.length === 1) {
        delete queryParams[optionName];
      }
    }

    if (queryParams['PageNumber']) {
      delete queryParams['PageNumber'];
    }

    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: queryParams,
    });
  }

  onPriceChange(priceQueryParamKey: 'MinPrice' | 'MaxPrice', value: number) {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    const currentRangeLimit =
      priceQueryParamKey === 'MinPrice'
        ? this.productFilters()?.minPrice
        : this.productFilters()?.maxPrice;

    if (value === currentRangeLimit) {
      delete queryParams[priceQueryParamKey];
    } else {
      queryParams[priceQueryParamKey] = value;
    }

    if (queryParams['PageNumber']) {
      delete queryParams['PageNumber'];
    }

    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: queryParams,
    });
  }

  onPageChange(pageEvent: PageEvent) {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    if (pageEvent.pageIndex === 0) {
      delete queryParams['PageNumber'];
    } else {
      queryParams['PageNumber'] = pageEvent.pageIndex + 1;
    }

    if (pageEvent.pageSize === this._productEcService.minPageSize) {
      delete queryParams['PageSize'];
    } else {
      queryParams['PageSize'] = pageEvent.pageSize;
    }

    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: queryParams,
    });
  }

  onResetSortAndFilters() {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    const keys = Object.keys(queryParams);

    keys
      .filter((k) => k !== 'PageSize' && k !== 'PageNumber')
      .forEach((key) => delete queryParams[key]);

    this._router.navigate([], {
      relativeTo: this._activatedRoute,
      queryParams: queryParams,
    });
  }

  private setAppliedSortAndFiltersCount(queryParamMap: ParamMap) {
    const sortAndBasicFiltersCount = queryParamMap.keys.filter((k) =>
      this._productEcService.basicSortAndFiltersQueryProductsListKeys.includes(
        k,
      ),
    ).length;

    this.appliedSortAndFiltersCount.set(
      Object.keys(this.currentOptions).reduce(
        (counter, key) => (counter += this.currentOptions[key].length),
        sortAndBasicFiltersCount,
      ),
    );
  }

  private setPageNumber(queryParamMap: ParamMap) {
    const pageNumberString = queryParamMap.get('PageNumber');

    if (pageNumberString) {
      const pageNumberNumber = +pageNumberString;

      if (!isNaN(pageNumberNumber)) {
        this.getPagedProductsEcQueryParams.pageNumber = pageNumberNumber;
      }
    } else {
      this.getPagedProductsEcQueryParams.pageNumber = 1;
    }
  }

  private setPageSize(queryParamMap: ParamMap) {
    const pageSizeString = queryParamMap.get('PageSize');

    if (pageSizeString) {
      const pageSizeNumber = +pageSizeString;

      if (!isNaN(pageSizeNumber)) {
        this.getPagedProductsEcQueryParams.pageSize = pageSizeNumber;
      }
    } else {
      this.getPagedProductsEcQueryParams.pageSize =
        this._productEcService.minPageSize;
    }
  }

  private setSortByChange(queryParamMap: ParamMap) {
    const sortBy = queryParamMap.get('SortBy');

    if (sortBy && isInEnum(sortBy, GetPagedProductsEcSortBy)) {
      this.getPagedProductsEcQueryParams.sortBy = sortBy;
    } else {
      this.getPagedProductsEcQueryParams.sortBy =
        this._productEcService.defaultSortBy;
    }
  }

  private setAndCheckMinPriceChange(queryParamMap: ParamMap) {
    const minPriceString = queryParamMap.get('MinPrice');

    if (minPriceString) {
      const minPriceNumber = +minPriceString;

      if (!isNaN(minPriceNumber)) {
        if (
          this.getProductFiltersByCategoryIdEcQueryParams.minPrice ===
            minPriceNumber &&
          this.getPagedProductsEcQueryParams.minPrice === minPriceNumber
        ) {
          return false;
        }

        this.getProductFiltersByCategoryIdEcQueryParams.minPrice =
          minPriceNumber;
        this.getPagedProductsEcQueryParams.minPrice = minPriceNumber;

        return true;
      }
    } else {
      if (
        this.getProductFiltersByCategoryIdEcQueryParams.minPrice ===
          undefined &&
        this.getPagedProductsEcQueryParams.minPrice === undefined
      ) {
        return false;
      }

      this.getProductFiltersByCategoryIdEcQueryParams.minPrice = undefined;
      this.getPagedProductsEcQueryParams.minPrice = undefined;
    }

    return true;
  }

  private setAndCheckMaxPriceChange(queryParamMap: ParamMap) {
    const maxPriceString = queryParamMap.get('MaxPrice');

    if (maxPriceString) {
      const maxPriceNumber = +maxPriceString;

      if (!isNaN(maxPriceNumber)) {
        if (
          this.getProductFiltersByCategoryIdEcQueryParams.maxPrice ===
            maxPriceNumber &&
          this.getPagedProductsEcQueryParams.maxPrice === maxPriceNumber
        ) {
          return false;
        }

        this.getProductFiltersByCategoryIdEcQueryParams.maxPrice =
          maxPriceNumber;
        this.getPagedProductsEcQueryParams.maxPrice = maxPriceNumber;

        return true;
      }
    } else {
      if (
        this.getProductFiltersByCategoryIdEcQueryParams.maxPrice ===
          undefined &&
        this.getPagedProductsEcQueryParams.maxPrice === undefined
      ) {
        return false;
      }

      this.getProductFiltersByCategoryIdEcQueryParams.maxPrice = undefined;
      this.getPagedProductsEcQueryParams.maxPrice = undefined;
    }

    return true;
  }

  private setAndCheckProductOptionsChange(queryParamMap: ParamMap) {
    const productOptionsKeys = queryParamMap.keys.filter(
      (k) =>
        !this._productEcService.availableBasicQueryProductsListKeys.includes(k),
    );

    let somethingChange = false;

    let productOptionValuesString: string | null;
    let currentProductOptionValues: string[];
    let splittedProductOptionValues: string[];

    let productOptionQueryParams = '[';

    productOptionsKeys.forEach((key) => {
      productOptionValuesString = queryParamMap.get(key);
      currentProductOptionValues = this.currentOptions[key];
      if (productOptionValuesString) {
        if (
          productOptionValuesString.length > 2 &&
          productOptionValuesString[0] === '(' &&
          productOptionValuesString[productOptionValuesString.length - 1] ===
            ')'
        ) {
          productOptionValuesString = productOptionValuesString.slice(
            1,
            productOptionValuesString.length - 1,
          );
          splittedProductOptionValues = productOptionValuesString.split(',');

          if (
            !currentProductOptionValues ||
            (splittedProductOptionValues.length <=
              currentProductOptionValues.length &&
              currentProductOptionValues.some(
                (o) => !splittedProductOptionValues.includes(o),
              )) ||
            (splittedProductOptionValues.length >
              currentProductOptionValues.length &&
              splittedProductOptionValues.some(
                (o) => !currentProductOptionValues.includes(o),
              ))
          ) {
            somethingChange = true;
            this.currentOptions[key] = splittedProductOptionValues;
          }
        } else {
          if (
            !currentProductOptionValues ||
            currentProductOptionValues.length !== 1
          ) {
            somethingChange = true;
            this.currentOptions[key] = [productOptionValuesString];
          }
        }

        productOptionQueryParams +=
          productOptionQueryParams.length > 1
            ? `;${key}:${productOptionValuesString}`
            : `${key}:${productOptionValuesString}`;
      }
    });

    const currentOptionKeys = Object.keys(this.currentOptions);

    if (somethingChange) {
      currentOptionKeys
        .filter((k) => !productOptionsKeys.includes(k))
        .forEach((k) => delete this.currentOptions[k]);
    } else if (currentOptionKeys.length > productOptionsKeys.length) {
      currentOptionKeys
        .filter((k) => !productOptionsKeys.includes(k))
        .forEach((k) => delete this.currentOptions[k]);
      somethingChange = true;
    }

    productOptionQueryParams += ']';

    this.getPagedProductsEcQueryParams.productOptionParam =
      productOptionQueryParams === '[]' ? undefined : productOptionQueryParams;
    this.getProductFiltersByCategoryIdEcQueryParams.productOptionParam =
      productOptionQueryParams === '[]' ? undefined : productOptionQueryParams;

    return somethingChange;
  }

  addProductToShoppingBasket(model: ProductListItemEc | ProductVariantEc) {
    this._addToShoppingBasketSubject.next(model);
  }

  onFavoriteClicked(productEncodedName: string) {
    this._toggleFavoriteSubject.next(productEncodedName);
  }

  isProductVariantEc(model: any): model is ProductVariantEc {
    return nameof<ProductVariantEc>('productVariantId') in model;
  }
}
