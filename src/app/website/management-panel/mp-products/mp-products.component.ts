import { NgTemplateOutlet, ViewportScroller } from '@angular/common';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  ActivatedRoute,
  Event,
  Router,
  RouterLink,
  Scroll,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  merge,
  zip,
  map,
  filter,
  first,
  finalize,
  skip,
  debounce,
  of,
  timer,
  tap,
  switchMap,
} from 'rxjs';
import { inAnimation } from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { DebounceFunction } from '../../../shared/functions/debounce-function';
import { isInEnum } from '../../../shared/functions/helper-functions';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { BreakpointObserverService } from '../../../shared/services/breakpoint-observer.service';
import { ProductMp } from '../models/product/product-mp.interface';
import { GetPagedProductsMpQueryParams } from '../models/query-params/get-paged-products-mp-query-params.interface';
import { GetPagedProductsMpSortBy } from '../models/query-sort-by/get-paged-products-mp-sort-by.interface';
import { ProductMpService } from '../services/product-mp.service';
import { MpDesktopProductsListComponent } from './mp-desktop-products-list/mp-desktop-products-list.component';
import { MpMobileProductsListComponent } from './mp-mobile-products-list/mp-mobile-products-list.component';

@Component({
  selector: 'app-mp-products',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MpMobileProductsListComponent,
    MpDesktopProductsListComponent,
    MatPaginatorModule,
    LoadingComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './mp-products.component.html',
  styleUrl: './mp-products.component.scss',
  animations: [inAnimation],
})
export class MpProductsComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _viewportScroller = inject(ViewportScroller);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _productsMpService = inject(ProductMpService);

  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;
  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;

  readonly products = signal<ProductMp[] | undefined>(undefined);

  readonly allowedPageSize =
    this._productsMpService.allowedPageSizeForPagedProducts;
  readonly appliedFiltersCount = signal(0);

  readonly requestQueryParams: GetPagedProductsMpQueryParams = {
    pageNumber: 1,
    pageSize: this._productsMpService.minPageSizeForPagedProducts,
  };

  readonly isLoadData = signal(true);

  readonly totalCount = toSignal(
    merge(
      zip([
        this._activatedRoute.data.pipe(
          map(({ products }) => {
            return products as ApiPagedResponse<ProductMp>;
          }),
        ),
        this._router.events.pipe(
          filter((e: Event): e is Scroll => e instanceof Scroll),
        ),
        this._activatedRoute.queryParamMap,
      ]).pipe(
        first(),
        map(([response, scrollEvent, queryParamMap]) => {
          this.requestQueryParams.pageNumber = response.pageNumber;
          this.requestQueryParams.pageSize = response.pageSize;

          const searchPhrase = queryParamMap.get('SearchPhrase');

          if (searchPhrase) {
            this.requestQueryParams.searchPhrase = searchPhrase;
          } else {
            this.requestQueryParams.searchPhrase = undefined;
          }

          const sortBy = queryParamMap.get('SortBy');

          if (isInEnum(sortBy, GetPagedProductsMpSortBy)) {
            this.requestQueryParams.sortBy = sortBy;
          }

          const sortDirection = queryParamMap.get('SortDirection');

          if (isInEnum(sortDirection, SortDirection)) {
            this.requestQueryParams.sortDirection = sortDirection;
          }

          this.products.set(response.data);

          if (scrollEvent.position) {
            this._changeDetectorRef.detectChanges();
            this._viewportScroller.scrollToPosition(scrollEvent.position);
          }

          this.appliedFiltersCount.set(
            queryParamMap.keys.filter((p) =>
              this._productsMpService.availableFiltersForPagedProducts.includes(
                p,
              ),
            ).length,
          );

          return response.totalCount;
        }),
        finalize(() => this.isLoadData.set(false)),
      ),
      zip([
        this._activatedRoute.queryParamMap,
        this._router.events.pipe(
          filter((e: Event): e is Scroll => e instanceof Scroll),
        ),
      ]).pipe(
        skip(1),
        debounce(([queryParamMap]) => {
          const pageNumber = queryParamMap.get('PageNumber');

          if (
            (pageNumber == null && this.requestQueryParams.pageNumber !== 1) ||
            (pageNumber && +pageNumber !== this.requestQueryParams.pageNumber)
          ) {
            return of(undefined);
          }

          return timer(300);
        }),
        tap(([queryParamMap]) => {
          const pageNumber = queryParamMap.get('PageNumber');

          if (pageNumber) {
            this.requestQueryParams.pageNumber = +pageNumber;
          } else {
            this.requestQueryParams.pageNumber = 1;
          }

          const pageSize = queryParamMap.get('PageSize');

          if (pageSize) {
            this.requestQueryParams.pageSize = +pageSize;
          } else {
            this.requestQueryParams.pageSize =
              this._productsMpService.minPageSizeForPagedProducts;
          }

          this.isLoadData.set(true);
        }),
        switchMap(([queryParamMap, scrollEvent]) =>
          this._productsMpService
            .getPagedProducts(this.requestQueryParams)
            .pipe(
              tap(() =>
                this.appliedFiltersCount.set(
                  queryParamMap.keys.filter((p) =>
                    this._productsMpService.availableFiltersForPagedProducts.includes(
                      p,
                    ),
                  ).length,
                ),
              ),
              map((response) => {
                this.products.set(response.data);

                if (scrollEvent.position) {
                  this._changeDetectorRef.detectChanges();
                  this._viewportScroller.scrollToPosition(scrollEvent.position);
                }

                return response.totalCount;
              }),
              finalize(() => this.isLoadData.set(false)),
            ),
        ),
      ),
    ),
  );

  onChangePage(pageEvent: PageEvent) {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    const pageNumber = pageEvent.pageIndex + 1;

    if (pageNumber === 1 && queryParams['PageNumber']) {
      delete queryParams['PageNumber'];
    } else if (pageNumber !== 1) {
      queryParams['PageNumber'] = pageNumber;
    }

    if (
      pageEvent.pageSize ===
        this._productsMpService.minPageSizeForPagedProducts &&
      queryParams['PageSize'] !==
        this._productsMpService.minPageSizeForPagedProducts
    ) {
      delete queryParams['PageSize'];
    } else {
      queryParams['PageSize'] = pageEvent.pageSize;
    }

    this._router.navigate([], { queryParams });
  }

  @DebounceFunction(500)
  onSearchPhraseChange(searchPhrase?: string) {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    if (!searchPhrase) {
      delete queryParams['SearchPhrase'];
    } else {
      queryParams['SearchPhrase'] = searchPhrase;
    }

    if (queryParams['PageNumber']) {
      delete queryParams['PageNumber'];
    }
    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  onSortChange() {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    if (this.requestQueryParams.sortBy != undefined) {
      queryParams['SortBy'] = this.requestQueryParams.sortBy;

      if (this.requestQueryParams.sortDirection == undefined) {
        this.requestQueryParams.sortDirection = SortDirection.Asc;
        queryParams['SortDirection'] = this.requestQueryParams.sortDirection;

        this._router.navigate([], { queryParams, replaceUrl: true });
        return;
      }
    } else {
      delete queryParams['SortBy'];
    }

    if (
      this.requestQueryParams.sortDirection == undefined ||
      this.requestQueryParams.sortBy == undefined
    ) {
      this.requestQueryParams.sortDirection = undefined;
      delete queryParams['SortDirection'];
    } else {
      queryParams['SortDirection'] = this.requestQueryParams.sortDirection;
    }

    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  onClearFilters() {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    this._activatedRoute.snapshot.queryParamMap.keys.forEach((key) => {
      if (
        this._productsMpService.availableFiltersForPagedProducts.includes(key)
      ) {
        delete queryParams[key];
      }
    });
    this.requestQueryParams.sortBy = undefined;
    this.requestQueryParams.sortDirection = undefined;
    this.requestQueryParams.searchPhrase = undefined;

    this._router.navigate([], { queryParams, replaceUrl: true });
  }
}
