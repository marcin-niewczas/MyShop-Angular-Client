import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { CategoryMpService } from '../services/category-mp.service';
import { CategoryMp } from '../models/category/category-mp.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { ViewportScroller } from '@angular/common';
import { Event, Router, RouterLink, Scroll } from '@angular/router';
import { BehaviorSubject, filter, switchMap, take, tap } from 'rxjs';
import { GetPagedCategoriesMpSortBy } from '../models/query-sort-by/get-paged-categories-mp-sort-by.enum';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GetPagedCategoriesMpQueryParams } from '../models/query-params/get-paged-categories-mp-query-params.interface';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { inAnimation, inOutAnimation } from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { CheckMaxHeightDirective } from '../../../shared/directives/check-max-height.directive';
import { GetPagedCategoriesQueryParam } from '../../../shared/models/requests/query-models/category/get-paged-categories-query-param.enum';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';

@Component({
  selector: 'app-mp-main-categories',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    InfiniteScrollDirective,
    CheckMaxHeightDirective,
    LoadingComponent,
  ],
  templateUrl: './mp-main-categories.component.html',
  styleUrl: './mp-main-categories.component.scss',
  animations: [inAnimation, inOutAnimation],
})
export class MpMainCategoriesComponent {
  private readonly _categoryMpService = inject(CategoryMpService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _router = inject(Router);
  private readonly _viewportScroller = inject(ViewportScroller);

  readonly queryParams: GetPagedCategoriesMpQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    queryType: GetPagedCategoriesQueryParam.Root,
    sortBy: GetPagedCategoriesMpSortBy.Name,
    sortDirection: SortDirection.Asc,
  };

  readonly rootCategories = signal<CategoryMp[] | undefined>(undefined);

  readonly isLoadData = signal(true);
  readonly isNextPage = signal(false);
  readonly initScroll = signal(true);

  private readonly _nextPageSubject = new BehaviorSubject(1);

  private readonly _loaderRootCategories = toSignal(
    this._router.events.pipe(
      filter((e: Event): e is Scroll => e instanceof Scroll),
      take(1),
      switchMap((scrollEvent) =>
        this._nextPageSubject.pipe(
          tap((pageNumber) => {
            this.isLoadData.set(true);
            this.queryParams.pageNumber = pageNumber;
          }),
          switchMap(() =>
            this._categoryMpService.getPagedData(this.queryParams).pipe(
              tap((response) => {
                this.rootCategories.update((currentValue) => {
                  if (currentValue) {
                    currentValue.push(...response.data);
                    return currentValue;
                  }

                  return response.data;
                });

                this._changeDetectorRef.detectChanges();

                this.isNextPage.set(response.isNext);

                if (!scrollEvent.position) {
                  this.initScroll.set(false);
                }

                if (
                  this.initScroll() &&
                  this.isNextPage() &&
                  scrollEvent.position &&
                  scrollEvent.position[1] + document.body.offsetHeight >=
                    document.body.scrollHeight
                ) {
                  this.loadMore();
                  return;
                } else if (
                  this.initScroll() &&
                  scrollEvent.position &&
                  scrollEvent.position[1] + document.body.offsetHeight <=
                    document.body.scrollHeight
                ) {
                  this.initScroll.set(false);
                  this._viewportScroller.scrollToPosition(scrollEvent.position);
                }

                this.isLoadData.set(false);
              }),
            ),
          ),
        ),
      ),
    ),
  );

  loadMore() {
    this._nextPageSubject.next(this.queryParams.pageNumber + 1);
  }
}
