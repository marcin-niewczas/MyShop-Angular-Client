import {
  CurrencyPipe,
  DatePipe,
  KeyValuePipe,
  ViewportScroller,
} from '@angular/common';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import {
  ActivatedRoute,
  Event,
  Router,
  RouterLink,
  Scroll,
} from '@angular/router';
import {
  map,
  switchMap,
  debounce,
  timer,
  filter,
  of,
  zip,
  first,
  merge,
  skip,
  tap,
  finalize,
} from 'rxjs';
import {
  inAnimation,
  rotateIconAnimation,
  expandCollapseAnimation,
  inOutAnimation,
} from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { DebounceFunction } from '../../../shared/functions/debounce-function';
import { getOrderStatusIcon } from '../../../shared/functions/order-status-functions';
import { Order } from '../../../shared/models/order/order.interface';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { TitleCaseFromStringPipe } from '../../../shared/pipes/title-case-from-enum-key.pipe';
import { BreakpointObserverService } from '../../../shared/services/breakpoint-observer.service';
import { GetPagedOrdersEcQueryParams } from '../../e-commerce/models/query-params/get-paged-orders-ec-query-params.interface';
import { GetPagedOrdersEcSortBy } from '../../e-commerce/models/query-sort-by/get-paged-orders-ec-sort-by.enum';
import { OrderEcService } from '../../e-commerce/services/order-ec.service';
import { AcPagedOrdersResolvedData } from './account-paged-orders.resolver';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [
    LoadingComponent,
    MatDividerModule,
    RouterLink,
    MatIconModule,
    MatSelectModule,
    KeyValuePipe,
    TitleCaseFromStringPipe,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule,
    MatBadgeModule,
    DatePipe,
    CurrencyPipe,
    SidebarComponent,
    MatPaginatorModule,
  ],
  templateUrl: './account-orders.component.html',
  styleUrl: './account-orders.component.scss',
  animations: [
    inAnimation,
    rotateIconAnimation,
    expandCollapseAnimation,
    inOutAnimation,
  ],
})
export class AccountOrdersComponent {
  private readonly _orderEcService = inject(OrderEcService);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _viewportScroller = inject(ViewportScroller);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;
  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;

  readonly filtersExpanded = signal(!this.isXSmallScreen());

  readonly orders = signal<Order[] | undefined>(undefined);

  private readonly _minPageSize = 10;
  readonly allowedPageSize: readonly number[] = [this._minPageSize, 15, 25];

  readonly requestQueryParams: GetPagedOrdersEcQueryParams = {
    pageNumber: 1,
    pageSize: this._minPageSize,
    sortBy: GetPagedOrdersEcSortBy.Newest,
    sortDirection: SortDirection.Desc,
    inclusiveToDate: false,
  };

  readonly isLoadData = signal(false);
  readonly isNextPage = signal(true);

  readonly appliedFiltersCount = signal(0);

  readonly OrderSortBy = GetPagedOrdersEcSortBy;
  readonly SortDirection = SortDirection;

  readonly maxDate = new Date();
  readonly minDate = new Date(this.maxDate.getFullYear() - 20, 0, 1);

  readonly filtersOpened = signal(false);

  readonly getOrderStatusIcon = getOrderStatusIcon;

  readonly totalCount = toSignal(
    merge(
      zip([
        this._activatedRoute.queryParamMap,
        this._activatedRoute.data.pipe(
          map(
            ({ acPagedOrdersResolvedData }) =>
              acPagedOrdersResolvedData as AcPagedOrdersResolvedData,
          ),
        ),
        this._router.events.pipe(
          filter((e: Event): e is Scroll => e instanceof Scroll),
        ),
      ]).pipe(
        first(),
        map(([queryParamMap, resolvedData, scrollEvent]) => {
          this.fillQueryParams(resolvedData.queryParams);

          this.orders.set(resolvedData.response.data);

          if (scrollEvent.position) {
            this._changeDetectorRef.detectChanges();
            this._viewportScroller.scrollToPosition(scrollEvent.position);
          }

          this.isLoadData.set(false);

          this.appliedFiltersCount.set(
            queryParamMap.keys.filter((p) =>
              this._orderEcService.availableFilters.includes(p),
            ).length,
          );

          return resolvedData.response.totalCount;
        }),
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
            this.requestQueryParams.pageSize = this._orderEcService.minPageSize;
          }

          const searchPhrase = queryParamMap.get('SearchPhrase');

          if (searchPhrase) {
            this.requestQueryParams.searchPhrase = searchPhrase;
          } else {
            this.requestQueryParams.searchPhrase = undefined;
          }

          const sortBy = queryParamMap.get('SortBy');

          if (sortBy) {
            this.requestQueryParams.sortBy = sortBy as GetPagedOrdersEcSortBy;
          } else {
            this.requestQueryParams.sortBy = this._orderEcService.defaultSortBy;
          }

          const sortDirection = queryParamMap.get('SortDirection');

          if (sortDirection) {
            this.requestQueryParams.sortDirection =
              sortDirection as SortDirection;
          } else {
            this.requestQueryParams.sortDirection =
              this._orderEcService.defaultSortDirection;
          }

          const fromDate = queryParamMap.get('FromDate');

          if (fromDate) {
            this.requestQueryParams.fromDate = fromDate;
          } else {
            this.requestQueryParams.fromDate = undefined;
          }

          const toDate = queryParamMap.get('ToDate');

          if (toDate) {
            this.requestQueryParams.toDate = toDate;
          } else {
            this.requestQueryParams.toDate = undefined;
          }

          this.isLoadData.set(true);
        }),
        switchMap(([queryParamMap, scrollEvent]) =>
          this._orderEcService.getPagedData(this.requestQueryParams).pipe(
            tap(() =>
              this.appliedFiltersCount.set(
                queryParamMap.keys.filter((p) =>
                  this._orderEcService.availableFilters.includes(p),
                ).length,
              ),
            ),
            map((response) => {
              this.orders.set(response.data);

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
      pageEvent.pageSize === this._orderEcService.minPageSize &&
      queryParams['PageSize'] !== this._orderEcService.minPageSize
    ) {
      delete queryParams['PageSize'];
    } else {
      queryParams['PageSize'] = pageEvent.pageSize;
    }

    this._router.navigate([], { queryParams });
  }

  private fillQueryParams(queryParams: GetPagedOrdersEcQueryParams) {
    this.requestQueryParams.pageNumber = queryParams.pageNumber;
    this.requestQueryParams.pageSize = queryParams.pageSize;
    this.requestQueryParams.sortBy = queryParams.sortBy;
    this.requestQueryParams.sortDirection = queryParams.sortDirection;
    this.requestQueryParams.fromDate = queryParams.fromDate;
    this.requestQueryParams.toDate = queryParams.toDate;
    this.requestQueryParams.inclusiveFromDate = queryParams.inclusiveFromDate;
    this.requestQueryParams.inclusiveToDate = queryParams.inclusiveToDate;
    this.requestQueryParams.searchPhrase = queryParams.searchPhrase;
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

  onSortByChange(sortBy: GetPagedOrdersEcSortBy) {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    if (sortBy !== this._orderEcService.defaultSortBy) {
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

  onDatePickerClosed(fromDateValue: string, toDateValue: string) {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    console.log(fromDateValue, toDateValue);

    if (
      fromDateValue == this.requestQueryParams.fromDate &&
      toDateValue == this.requestQueryParams.toDate
    ) {
      return;
    }

    if (fromDateValue) {
      queryParams['FromDate'] = new Date(
        Date.parse(fromDateValue),
      ).toISOString();
    } else {
      delete queryParams['FromDate'];
    }

    if (toDateValue) {
      queryParams['ToDate'] = new Date(Date.parse(toDateValue)).toISOString();
    } else {
      delete queryParams['ToDate'];
    }

    if (queryParams['PageNumber']) {
      delete queryParams['PageNumber'];
    }

    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  onFromDateChange(date?: Date | string | number | null) {
    if (date == null && !this.requestQueryParams.fromDate) {
      return;
    }

    if (date != null && date < this.minDate) {
      return;
    }

    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    if (date) {
      queryParams['FromDate'] = (date as Date).toISOString();
    } else {
      this.requestQueryParams.fromDate = undefined;
      delete queryParams['FromDate'];
    }

    if (queryParams['PageNumber']) {
      delete queryParams['PageNumber'];
    }

    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  onToDateChange(date?: Date | string | number | null) {
    if (date == null && !this.requestQueryParams.fromDate) {
      return;
    }

    if (date != null && date > this.maxDate) {
      return;
    }

    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    if (date) {
      queryParams['ToDate'] = (date as Date).toISOString();
    } else {
      this.requestQueryParams.fromDate = undefined;
      delete queryParams['ToDate'];
    }

    if (queryParams['PageNumber']) {
      delete queryParams['PageNumber'];
    }

    this._router.navigate([], { queryParams, replaceUrl: true });
  }

  resetFilters() {
    const queryParams = { ...this._activatedRoute.snapshot.queryParams };

    delete queryParams['SortDirection'];
    delete queryParams['SortBy'];
    delete queryParams['SearchPhrase'];
    delete queryParams['FromDate'];
    delete queryParams['ToDate'];

    this._router.navigate([]);
  }
}
