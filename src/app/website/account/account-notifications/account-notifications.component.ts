import { NgClass, KeyValuePipe, ViewportScroller } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import {
  Subject,
  merge,
  map,
  debounceTime,
  tap,
  switchMap,
  finalize,
} from 'rxjs';
import {
  inAnimation,
  inOutAnimation,
  rotateIconAnimation,
  expandCollapseAnimation,
} from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { SortDirectionIconButtonComponent } from '../../../shared/components/sort-direction-icon-button/sort-direction-icon-button.component';
import { CheckMaxHeightDirective } from '../../../shared/directives/check-max-height.directive';
import {
  getNotificationIcon,
  getNotificationRouterLink,
  getNotificationTitle,
} from '../../../shared/functions/notification-functions';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { GetPagedNotificationsQueryParams } from '../../../shared/models/requests/query-models/notification/get-paged-notifications-query-params.interface';
import { NotificationMessage } from '../../../shared/models/notification/notification-message.interface';
import { GetPagedNotificationsSortBy } from '../../../shared/models/sort-by/get-paged-notifications-sort-by.enum';
import { DateAgoPipe } from '../../../shared/pipes/date-ago.pipe';
import { TitleCaseFromStringPipe } from '../../../shared/pipes/title-case-from-enum-key.pipe';
import { BreakpointObserverService } from '../../../shared/services/breakpoint-observer.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { NotificationType } from '../../../shared/models/notification/notification-type.enum';

@Component({
  selector: 'app-account-notifications',
  standalone: true,
  imports: [
    LoadingComponent,
    MatDividerModule,
    RouterLink,
    DateAgoPipe,
    MatIconModule,
    NgClass,
    InfiniteScrollDirective,
    CheckMaxHeightDirective,
    MatSelectModule,
    KeyValuePipe,
    TitleCaseFromStringPipe,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    FormsModule,
    CdkAccordionModule,
    MatBadgeModule,
    SortDirectionIconButtonComponent,
  ],
  templateUrl: './account-notifications.component.html',
  styleUrl: './account-notifications.component.scss',
  animations: [
    inAnimation,
    inOutAnimation,
    rotateIconAnimation,
    expandCollapseAnimation,
  ],
})
export class AccountNotificationsComponent implements OnInit {
  private readonly _notificationService = inject(NotificationService);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _viewportScroller = inject(ViewportScroller);

  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;

  readonly maxDate = new Date();
  readonly minDate = new Date(this.maxDate.getFullYear() - 20, 0, 1);

  readonly filtersExpanded = signal(!this.isXSmallScreen());

  readonly notifications = signal<NotificationMessage[] | undefined>(undefined);
  readonly unreadNotificationsCount = signal<number | undefined>(undefined);

  readonly getNotificationIcon = getNotificationIcon;
  readonly getNotificationRouterLink = getNotificationRouterLink;
  readonly getNotificationTitle = getNotificationTitle;
  
  readonly NotificationType = NotificationType;

  readonly queryParams: GetPagedNotificationsQueryParams = {
    pageNumber: 0,
    pageSize: 30,
    sortBy: GetPagedNotificationsSortBy.Newest,
    sortDirection: SortDirection.Desc,
    withUnreadNotificationCount: true,
    inclusiveToDate: false,
  };

  tempFromDate?: Date | null = undefined;
  tempToDate?: Date | null = undefined;

  private readonly _paginatorSubject = new Subject<void>();
  private readonly _resetDataSubject = new Subject<void>();

  readonly isResetDataProcess = signal(false);

  readonly totalCount = toSignal(
    merge(
      this._paginatorSubject.pipe(
        map(() => {
          this.queryParams.pageNumber += 1;
          return false;
        }),
      ),
      this._resetDataSubject.pipe(
        debounceTime(300),
        map(() => {
          this._viewportScroller.scrollToPosition([0, 0]);
          this.queryParams.pageNumber = 1;

          return true;
        }),
      ),
    ).pipe(
      tap((isReset) => {
        this.isLoadData.set(true);

        if (isReset) {
          this.isResetDataProcess.set(true);
        }
      }),
      switchMap((isReset) =>
        this._notificationService.getPagedNotifications(this.queryParams).pipe(
          tap((response) => {
            this.isNextPage.set(response.isNext);
            this.unreadNotificationsCount.set(response.unreadNotificationCount);

            if (isReset) {
              this.notifications.update(() => response.data);
              return;
            }

            if (this.notifications()) {
              this.notifications.update((current) => {
                current?.push(...response.data);
                return current;
              });
              return;
            }

            this.notifications.set(response.data);
          }),
          map((response) => response.totalCount),
          finalize(() => {
            this.isLoadData.set(false);

            if (isReset) {
              this.isResetDataProcess.set(false);
            }
          }),
        ),
      ),
    ),
  );

  private readonly _setAllNotificationsAsReadSubject = new Subject<void>();

  private readonly _setAllNotificationsAsRead = toSignal(
    this._setAllNotificationsAsReadSubject.pipe(
      switchMap(() =>
        this._notificationService.setAllNotificationsAsRead().pipe(
          tap((response) => {
            this.notifications.update((notifiactions) =>
              notifiactions?.map((notifiaction) => {
                notifiaction.isRead = true;
                return notifiaction;
              }),
            );

            this.unreadNotificationsCount.set(response.data.value);
          }),
        ),
      ),
    ),
  );

  readonly isLoadData = signal(false);
  readonly isNextPage = signal(true);

  readonly appliedFiltersCount = signal(0);

  readonly NotificationSortBy = GetPagedNotificationsSortBy;
  readonly SortDirection = SortDirection;

  ngOnInit(): void {
    this.nextPage();
  }

  setAsReadNotification(notification: NotificationMessage) {
    if (!notification.isRead) {
      this._notificationService.triggerSetAsReadNotification(notification.id);
    }
  }

  nextPage() {
    this._paginatorSubject.next();
  }

  onSortByChange() {
    if (this.queryParams.sortBy !== GetPagedNotificationsSortBy.Newest) {
      this.appliedFiltersCount.set(this.appliedFiltersCount() + 1);
    } else {
      this.appliedFiltersCount.set(this.appliedFiltersCount() - 1);
    }

    this._resetDataSubject.next();
  }

  onSortDirectionChange(sortDirection?: SortDirection) {
    if (sortDirection === SortDirection.Asc) {
      this.appliedFiltersCount.set(this.appliedFiltersCount() + 1);
    } else {
      this.appliedFiltersCount.set(this.appliedFiltersCount() - 1);
    }

    this._resetDataSubject.next();
  }

  onFromDateChange(date?: Date | null) {
    if (date == null && !this.queryParams.fromDate) {
      return;
    }

    this.queryParams.fromDate =
      date == null ? undefined : encodeURIComponent(date.toISOString());

    this._resetDataSubject.next();

    this.queryParams.fromDate == undefined
      ? this.appliedFiltersCount.set(this.appliedFiltersCount() - 1)
      : this.appliedFiltersCount.set(this.appliedFiltersCount() + 1);
  }

  onToDateChange(date?: Date | null) {
    if (date == null && !this.queryParams.toDate) {
      return;
    }

    this.queryParams.toDate =
      date == null ? undefined : encodeURIComponent(date.toISOString());
    this._resetDataSubject.next();

    this.queryParams.toDate == undefined
      ? this.appliedFiltersCount.set(this.appliedFiltersCount() - 1)
      : this.appliedFiltersCount.set(this.appliedFiltersCount() + 1);
  }

  onDatePickerClosed() {
    const fromDate = this.tempFromDate
      ? encodeURIComponent(this.tempFromDate.toISOString())
      : undefined;
    const toDate = this.tempToDate
      ? encodeURIComponent(this.tempToDate.toISOString())
      : undefined;

    if (
      fromDate !== this.queryParams.fromDate ||
      toDate !== this.queryParams.toDate
    ) {
      if (fromDate && !this.queryParams.fromDate) {
        this.appliedFiltersCount.set(this.appliedFiltersCount() + 1);
      } else if (!fromDate && this.queryParams.fromDate) {
        this.appliedFiltersCount.set(this.appliedFiltersCount() - 1);
      }

      if (toDate && !this.queryParams.toDate) {
        this.appliedFiltersCount.set(this.appliedFiltersCount() + 1);
      } else if (!toDate && this.queryParams.toDate) {
        this.appliedFiltersCount.set(this.appliedFiltersCount() - 1);
      }

      this.queryParams.fromDate = fromDate;
      this.queryParams.toDate = toDate;

      this._resetDataSubject.next();
    }
  }

  isDisabledResetFilters() {
    return (
      this.queryParams.sortBy === GetPagedNotificationsSortBy.Newest &&
      this.queryParams.sortDirection === SortDirection.Desc &&
      !this.queryParams.fromDate &&
      !this.queryParams.toDate
    );
  }

  resetFilters() {
    this.queryParams.sortBy = GetPagedNotificationsSortBy.Newest;
    this.queryParams.sortDirection = SortDirection.Desc;
    this.tempFromDate = null;
    this.tempToDate = null;
    this.queryParams.fromDate = undefined;
    this.queryParams.toDate = undefined;

    this.appliedFiltersCount.set(0);

    this._resetDataSubject.next();
  }

  setAllNotificationsAsRead() {
    this._setAllNotificationsAsReadSubject.next();
  }
}
