import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { GetPagedFavoritesAcSortBy } from '../models/query-sort-by/get-paged-favorites-ac-sort-by.enum';
import {
  CurrencyPipe,
  KeyValuePipe,
  NgClass,
  NgTemplateOutlet,
  ViewportScroller,
} from '@angular/common';
import { FavoriteAcService } from '../services/favorite-ac.service';
import { GetPagedFavoritesAcQueryParams } from '../models/favorite/get-paged-favorites-ac-query-params.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import {
  ActivatedRoute,
  Event,
  ParamMap,
  Router,
  RouterLink,
  Scroll,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Subject,
  filter,
  finalize,
  first,
  map,
  merge,
  skip,
  switchMap,
  tap,
  zip,
} from 'rxjs';
import { ProductListItemAc } from '../models/product/product-list-item-ac.interface';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { expandCollapseAnimation, inOutAnimation } from '../../../shared/components/animations';
import { PhotoComponent } from '../../../shared/components/photo/photo.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { SortDirectionIconButtonComponent } from '../../../shared/components/sort-direction-icon-button/sort-direction-icon-button.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { DebounceFunction } from '../../../shared/functions/debounce-function';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { BreakpointObserverService } from '../../../shared/services/breakpoint-observer.service';
import { ResolvedDataOfPagedFavoritesAc } from './account-paged-favorites.resolver';

@Component({
  selector: 'app-account-favorites',
  standalone: true,
  imports: [
    MatSelectModule,
    MatInputModule,
    SortDirectionIconButtonComponent,
    MatIconModule,
    KeyValuePipe,
    SidebarComponent,
    MatButtonModule,
    MatPaginatorModule,
    NgTemplateOutlet,
    PhotoComponent,
    RouterLink,
    MatDividerModule,
    NgClass,
    StarRatingComponent,
    CurrencyPipe,
    MatBadgeModule,
  ],
  templateUrl: './account-favorites.component.html',
  styleUrl: './account-favorites.component.scss',
  animations: [expandCollapseAnimation, inOutAnimation],
})
export class AccountFavoritesComponent {
  private readonly _favoriteAcService = inject(FavoriteAcService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _viewportScroller = inject(ViewportScroller);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  readonly breakpointObserverService = inject(BreakpointObserverService);

  readonly GetPagedFavoritesAcSortBy = GetPagedFavoritesAcSortBy;

  readonly mobileFilterOpened = signal(false);
  readonly desktopFilterOpened = signal(true);

  readonly allowedPageSizes = this._favoriteAcService.allowedPageSize;

  queryParams: GetPagedFavoritesAcQueryParams = {
    pageNumber: 1,
    pageSize: 10,
  };

  readonly isLoadPagedFavorites = signal(true);

  readonly pagedFavorites = signal<ProductListItemAc[] | undefined>(undefined);

  readonly appliedFiltersCount = signal<number>(0);

  private readonly _reloadPagedFavoritesSubject = new Subject<void>();

  private readonly _removeFromFavoritesSubject = new Subject<string>();
  readonly isRemoveFromFavoritesProcess = signal(false);

  private readonly _removeFromFavoritesTask = toSignal(
    this._removeFromFavoritesSubject.pipe(
      tap(() => this.isRemoveFromFavoritesProcess.set(true)),
      switchMap((encodedName) =>
        this._favoriteAcService
          .removeFavorite(encodedName)
          .pipe(tap(() => this._reloadPagedFavoritesSubject.next())),
      ),
    ),
  );

  readonly totalCount = toSignal(
    merge(
      zip([
        this._activatedRoute.data.pipe(
          map(({ resolvedDataOfPagedFavoritesAc }) => {
            const data =
              resolvedDataOfPagedFavoritesAc as ResolvedDataOfPagedFavoritesAc;
            this.queryParams = data.queryParams;
            this.setAppliedFiltersCount(data.paramMap);

            return data.response;
          }),
        ),
        this._router.events.pipe(
          filter((e: Event): e is Scroll => e instanceof Scroll),
        ),
      ]).pipe(
        first(),
        map(([response, scrollEvent]) => {
          this.pagedFavorites.set(response.data as ProductListItemAc[]);

          if (scrollEvent && scrollEvent.position) {
            this._changeDetectorRef.detectChanges();
            this._viewportScroller.scrollToPosition(scrollEvent.position);
          }

          return response.totalCount;
        }),
        finalize(() => this.isLoadPagedFavorites.set(false)),
      ),
      zip([
        this._activatedRoute.queryParamMap.pipe(
          skip(1),
          tap((queryParamMap) => {
            const pageSize = queryParamMap.get('PageSize');

            if (pageSize) {
              this.queryParams.pageSize = +pageSize;
            } else {
              this.queryParams.pageSize = this._favoriteAcService.minPageSize;
            }

            const pageNumber = queryParamMap.get('PageNumber');

            if (pageNumber) {
              this.queryParams.pageNumber = +pageNumber;
            } else {
              this.queryParams.pageNumber = 1;
            }

            const searchPhrase = queryParamMap.get('SearchPhrase');

            if (searchPhrase) {
              this.queryParams.searchPhrase = searchPhrase;
            } else {
              this.queryParams.searchPhrase = undefined;
            }

            const sortBy = queryParamMap.get('SortBy');

            if (sortBy) {
              this.queryParams.sortBy = sortBy as GetPagedFavoritesAcSortBy;
            } else {
              this.queryParams.sortBy = GetPagedFavoritesAcSortBy.Newest;
            }

            const sortDirection = queryParamMap.get('SortDirection');

            if (sortDirection) {
              this.queryParams.sortDirection = sortDirection as SortDirection;
            } else {
              this.queryParams.sortDirection = SortDirection.Desc;
            }
          }),
        ),
        this._router.events.pipe(
          skip(1),
          filter((e: Event): e is Scroll => e instanceof Scroll),
        ),
      ]).pipe(
        tap(() => this.isLoadPagedFavorites.set(true)),
        switchMap(([paramMap, scrollEvent]) =>
          this._favoriteAcService.getPagedData(this.queryParams).pipe(
            map((response) => {
              this.setAppliedFiltersCount(paramMap);

              this.pagedFavorites.set(response.data as ProductListItemAc[]);

              if (scrollEvent && scrollEvent.position) {
                this._changeDetectorRef.detectChanges();
                this._viewportScroller.scrollToPosition(scrollEvent.position);
              }

              return response.totalCount;
            }),
            finalize(() => this.isLoadPagedFavorites.set(false)),
          ),
        ),
      ),
      this._reloadPagedFavoritesSubject.pipe(
        tap(() => this.isLoadPagedFavorites.set(true)),
        switchMap(() =>
          this._favoriteAcService.getPagedData(this.queryParams).pipe(
            map((response) => {
              this.pagedFavorites.set(response.data as ProductListItemAc[]);
              return response.totalCount;
            }),
            finalize(() => {
              this.isRemoveFromFavoritesProcess.set(false);
              this.isLoadPagedFavorites.set(false);
            }),
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
      pageEvent.pageSize === this._favoriteAcService.minPageSize &&
      queryParams['PageSize'] !== this._favoriteAcService.minPageSize
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

  onSearchPhraseClear() {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };
    delete queryParams['SearchPhrase'];

    if (queryParams['PageNumber']) {
      delete queryParams['PageNumber'];
    }

    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  onSortByChange(sortBy: GetPagedFavoritesAcSortBy) {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    if (sortBy !== GetPagedFavoritesAcSortBy.Newest) {
      queryParams['SortBy'] = sortBy;
    } else {
      delete queryParams['SortBy'];
    }

    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  onSortDirectionChange() {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    if (queryParams['SortDirection'] == null) {
      queryParams['SortDirection'] = SortDirection.Asc;
    } else {
      delete queryParams['SortDirection'];
    }

    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  resetFilters() {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    delete queryParams['SortDirection'];
    delete queryParams['SortBy'];
    delete queryParams['SearchPhrase'];

    this._router.navigate([]);
  }

  removeFromFavorites(encodedName: string) {
    this._removeFromFavoritesSubject.next(encodedName);
  }

  private setAppliedFiltersCount(paramMap: ParamMap) {
    this.appliedFiltersCount.set(
      paramMap.keys.filter(
        (key) =>
          !this._favoriteAcService.availablePaginationQueryKey.includes(key),
      ).length,
    );
  }
}
