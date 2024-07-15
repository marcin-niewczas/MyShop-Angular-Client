import { DatePipe, KeyValuePipe } from '@angular/common';
import {
  Component,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Subject,
  debounceTime,
  finalize,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs';
import { MatDividerModule } from '@angular/material/divider';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { inAnimation, inOutAnimation } from '../../../../../shared/components/animations';
import { AvatarComponent } from '../../../../../shared/components/avatar/avatar.component';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { ReviewRatingStatsComponent } from '../../../../../shared/components/review-rating-stats/review-rating-stats.component';
import { SidebarComponent } from '../../../../../shared/components/sidebar/sidebar.component';
import { SortDirectionIconButtonComponent } from '../../../../../shared/components/sort-direction-icon-button/sort-direction-icon-button.component';
import { StarRatingComponent } from '../../../../../shared/components/star-rating/star-rating.component';
import { CheckMaxHeightDirective } from '../../../../../shared/directives/check-max-height.directive';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import { ProductReviewRateStats } from '../../../../../shared/models/product/product-review-rate-stats.interface';
import { SortDirection } from '../../../../../shared/models/requests/query-models/common/sort-direction.enum';
import { GetPagedProductReviewsQueryParams } from '../../../../../shared/models/requests/query-models/product-review/get-paged-product-reviews-query-params.interface';
import { GetPagedProductReviewsSortBy } from '../../../../../shared/models/sort-by/get-paged-product-reviews-sort-by.enum';
import { BreakpointObserverService } from '../../../../../shared/services/breakpoint-observer.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PagedProductReviewMp } from '../../../models/product-review/paged-product-review-mp.interface';
import { ProductMpService } from '../../../services/product-mp.service';
import { ProductReviewMpService } from '../../../services/product-review-mp.service';

@Component({
  selector: 'app-mp-product-review-sidebar',
  standalone: true,
  imports: [
    SidebarComponent,
    MatButtonModule,
    MatIconModule,
    ReviewRatingStatsComponent,
    MatChipsModule,
    KeyValuePipe,
    SortDirectionIconButtonComponent,
    MatDividerModule,
    LoadingComponent,
    StarRatingComponent,
    AvatarComponent,
    DatePipe,
    CheckMaxHeightDirective,
    InfiniteScrollDirective,
  ],
  templateUrl: './mp-product-review-sidebar.component.html',
  styleUrl: './mp-product-review-sidebar.component.scss',
  animations: [inAnimation, inOutAnimation],
})
export class MpProductReviewSidebarComponent implements OnChanges {
  private readonly _productMpService = inject(ProductMpService);
  private readonly _productReviewMpService = inject(ProductReviewMpService);
  private readonly _toastService = inject(ToastService);

  readonly breakpointObserverService = inject(BreakpointObserverService);
  readonly opened = model.required<boolean>();

  readonly productReviewRateStats = model.required<ProductReviewRateStats>();
  readonly productId = input.required<string>();

  readonly GetPagedProductReviewsSortBy = GetPagedProductReviewsSortBy;

  readonly queryParams: GetPagedProductReviewsQueryParams = {
    pageNumber: 0,
    pageSize: 10,
    sortDirection: SortDirection.Desc,
    sortBy: GetPagedProductReviewsSortBy.Newest,
  };

  readonly isNextPagedProductReviews = signal(false);
  readonly isLoadPagedProductReviews = signal(false);
  readonly isResetPagedProductReviews = signal(false);
  readonly productReviews = signal<PagedProductReviewMp[] | undefined>(
    undefined,
  );

  private readonly _loadProductReviewsSubject = new Subject<
    'LoadMore' | 'Reset'
  >();

  private readonly _loadPagedProductReviewsTask = toSignal(
    this._loadProductReviewsSubject.pipe(
      debounceTime(300),
      tap((type) => {
        if (type === 'Reset') {
          this.queryParams.pageNumber = 1;
          this.isResetPagedProductReviews.set(true);
        } else {
          this.queryParams.pageNumber += 1;
        }

        this.isLoadPagedProductReviews.set(true);
      }),
      switchMap((type) =>
        this._productMpService
          .getPagedProductReviewsByProductId(this.productId(), this.queryParams)
          .pipe(
            tap((response) => {
              this.isNextPagedProductReviews.set(response.isNext);

              if (type === 'Reset') {
                this.productReviews.set(response.data);
              } else {
                this.productReviews.update((current) => {
                  if (current) {
                    current.push(...response.data);
                    return current;
                  }

                  return response.data;
                });
              }
            }),
            finalize(() => {
              this.isLoadPagedProductReviews.set(false);
              this.isResetPagedProductReviews.set(false);
            }),
          ),
      ),
    ),
  );

  readonly isProductReviewRateStatsRefresh = model.required<boolean>();
  private readonly _productReviewRateStatsRefreshSubject = new Subject<void>();

  private readonly _productReviewRateStatsRefreshTask = toSignal(
    this._productReviewRateStatsRefreshSubject.pipe(
      tap(() => this.isProductReviewRateStatsRefresh.set(true)),
      switchMap(() =>
        this._productMpService.getProductReviewRateStats(this.productId()).pipe(
          tap((response) => this.productReviewRateStats.set(response.data)),

          finalize(() => this.isProductReviewRateStatsRefresh.set(false)),
        ),
      ),
    ),
  );

  readonly currentRemoveProductReviewId = signal<string | undefined>(undefined);

  private readonly _removeProductReviewSubject = new Subject<string>();

  private readonly _removeProductReviewTask = toSignal(
    this._removeProductReviewSubject.pipe(
      mergeMap((id) =>
        this._productReviewMpService.remove(id).pipe(
          tap(() => {
            this._toastService.success('The Product Review has been removed.');
            this._loadProductReviewsSubject.next('Reset');
            this._productReviewRateStatsRefreshSubject.next();
          }),
          catchHttpError(this._toastService),
        ),
      ),
    ),
  );

  private _isFirstOpened = true;

  ngOnChanges(changes: SimpleChanges): void {
    const openedValue = changes['opened']?.currentValue;

    if (openedValue && this._isFirstOpened) {
      this._isFirstOpened = false;
      this._loadProductReviewsSubject.next('LoadMore');
    }
  }

  onActiveRateChange(rate?: number) {
    this.queryParams.productReviewRate = rate;
    this._loadProductReviewsSubject.next('Reset');
  }

  onSortByChange(sortBy: GetPagedProductReviewsSortBy) {
    this.queryParams.sortBy = sortBy;
    this._loadProductReviewsSubject.next('Reset');
  }

  onSortDirectionChange(sortDirection?: SortDirection) {
    this.queryParams.sortDirection = sortDirection;
    this._loadProductReviewsSubject.next('Reset');
  }

  onRemoveProductReview(id: string) {
    this.currentRemoveProductReviewId.set(id);
    this._removeProductReviewSubject.next(id);
  }

  onLoadMoreProductReviews() {
    this._loadProductReviewsSubject.next('LoadMore');
  }
}
