import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ActivatedRoute,
  Event,
  Router,
  RouterLink,
  Scroll,
} from '@angular/router';
import {
  debounce,
  filter,
  finalize,
  first,
  map,
  merge,
  of,
  skip,
  switchMap,
  tap,
  timer,
  zip,
} from 'rxjs';
import { ProductOptionMp } from '../models/product-option/product-option-mp.interface';
import { NgTemplateOutlet, ViewportScroller } from '@angular/common';
import { MpMobileProductOptionsListComponent } from './mp-mobile-product-options-list/mp-mobile-product-options-list.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ProductOptionTypeMpQueryType } from '../models/query-types/product-option-type-mp-query-type.enum';
import { inAnimation } from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { DebounceFunction } from '../../../shared/functions/debounce-function';
import { isInEnum } from '../../../shared/functions/helper-functions';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { BreakpointObserverService } from '../../../shared/services/breakpoint-observer.service';
import { GetPagedProductOptionsMpQueryParams } from '../models/query-params/get-paged-product-options-mp-query-params.interface';
import { GetPagedProductOptionsMpSortBy } from '../models/query-sort-by/get-paged-product-options-mp-sort-by.enum';
import { ProductOptionsSubtypeMpQueryType } from '../models/query-types/product-options-mp-query-type.enum';
import { ProductOptionMpService } from '../services/product-option-mp.service';
import { MpDesktopProductOptionsListComponent } from './mp-desktop-product-options-list/mp-desktop-product-options-list.component';

@Component({
  selector: 'app-mp-product-options',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MpMobileProductOptionsListComponent,
    MpDesktopProductOptionsListComponent,
    MatPaginatorModule,
    LoadingComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './mp-product-options.component.html',
  styleUrl: './mp-product-options.component.scss',
  animations: [inAnimation],
})
export class MpProductOptionsComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _viewportScroller = inject(ViewportScroller);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _productOptionMpService = inject(ProductOptionMpService);

  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;
  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;

  readonly productOptions = signal<ProductOptionMp[] | undefined>(undefined);

  readonly allowedPageSize = this._productOptionMpService.allowedPageSize;
  readonly appliedFiltersCount = signal(0);

  readonly requestQueryParams: GetPagedProductOptionsMpQueryParams = {
    pageNumber: 1,
    pageSize: this._productOptionMpService.minPageSize,
    queryType: ProductOptionTypeMpQueryType.All,
    subqueryType: ProductOptionsSubtypeMpQueryType.All,
  };

  readonly isLoadData = signal(true);

  readonly totalCount = toSignal(
    merge(
      zip([
        this._activatedRoute.data.pipe(
          map(({ productOptions }) => {
            return productOptions as ApiPagedResponse<ProductOptionMp>;
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

          if (isInEnum(sortBy, GetPagedProductOptionsMpSortBy)) {
            this.requestQueryParams.sortBy = sortBy;
          }

          const sortDirection = queryParamMap.get('SortDirection');

          if (isInEnum(sortDirection, SortDirection)) {
            this.requestQueryParams.sortDirection = sortDirection;
          }

          this.productOptions.set(response.data);

          if (scrollEvent.position) {
            this._changeDetectorRef.detectChanges();
            this._viewportScroller.scrollToPosition(scrollEvent.position);
          }

          this.appliedFiltersCount.set(
            queryParamMap.keys.filter((p) =>
              this._productOptionMpService.availableFilters.includes(p),
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
              this._productOptionMpService.minPageSize;
          }

          this.isLoadData.set(true);
        }),
        switchMap(([queryParamMap, scrollEvent]) =>
          this._productOptionMpService
            .getPagedData(this.requestQueryParams)
            .pipe(
              tap(() =>
                this.appliedFiltersCount.set(
                  queryParamMap.keys.filter((p) =>
                    this._productOptionMpService.availableFilters.includes(p),
                  ).length,
                ),
              ),
              map((response) => {
                this.productOptions.set(response.data);

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
      pageEvent.pageSize === this._productOptionMpService.minPageSize &&
      queryParams['PageSize'] !== this._productOptionMpService.minPageSize
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
      if (this._productOptionMpService.availableFilters.includes(key)) {
        delete queryParams[key];
      }
    });
    this.requestQueryParams.sortBy = undefined;
    this.requestQueryParams.sortDirection = undefined;
    this.requestQueryParams.searchPhrase = undefined;

    this._router.navigate([], { queryParams, replaceUrl: true });
  }
}
