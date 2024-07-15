import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { SortDirection } from '../models/requests/query-models/common/sort-direction.enum';
import { GetPagedNotificationsResponse } from '../models/responses/notification/get-paged-notifications-response.interface';
import { Subject, finalize, merge, switchMap, tap } from 'rxjs';
import { GetPagedNotificationsSortBy } from '../models/sort-by/get-paged-notifications-sort-by.enum';
import { NotificationMessage } from '../models/responses/notification/notification-message.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiResponse } from '../models/responses/api-response.interface';
import { GetPagedNotificationsQueryParams } from '../models/requests/query-models/notification/get-paged-notifications-query-params.interface';
import { ValueData } from '../models/value-data.interface';
import { EnvironmentService } from '../../../environments/environment.service';
import { UrlBuilderService } from './url-builder.service';
import { NotificationHubService } from './hubs/notification-hub.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _client = inject(HttpClient);
  private readonly _environment = inject(EnvironmentService);
  private readonly _urlBuilderService = inject(UrlBuilderService);
  private readonly _notificationHubService = inject(NotificationHubService);

  private readonly _baseUrl = `${this._environment.apiAccountUrl}/notifications`;

  private readonly _notifications = signal<NotificationMessage[] | undefined>(
    undefined
  );
  readonly notifications = this._notifications.asReadonly();

  private readonly _unreadNotificationCount = signal<number | undefined>(
    undefined
  );
  readonly unreadNotificationsCount =
    this._unreadNotificationCount.asReadonly();

  private readonly _isSetNotificationAsReadProcess = signal(false);
  readonly isSetNotificationAsReadProcess =
    this._isSetNotificationAsReadProcess.asReadonly();

  private readonly _loadMoreNotificationsSubject = new Subject<void>();

  private readonly _setAsReadNotificationSubject = new Subject<string>();

  private readonly _setAsReadNotification = toSignal(
    this._setAsReadNotificationSubject.pipe(
      switchMap((id) => this.setAsReadNotification(id))
    )
  );

  private readonly _setAllNotificationsAsReadSubject = new Subject<void>();

  private readonly _setAllNotificationsAsRead = toSignal(
    this._setAllNotificationsAsReadSubject.pipe(
      switchMap(() => this.setAllNotificationsAsRead())
    )
  );

  private readonly _isNextNotificationsPage = signal(false);
  readonly isNextNotificationsPage = this._isNextNotificationsPage.asReadonly();

  private readonly _isLoadMoreNotificationsProcess = signal(false);
  readonly isLoadMoreNotificationsProcess =
    this._isLoadMoreNotificationsProcess.asReadonly();

  private readonly _pageSize = 15;

  private readonly _queryParams: GetPagedNotificationsQueryParams = {
    pageNumber: 0,
    pageSize: this._pageSize,
    sortBy: GetPagedNotificationsSortBy.Newest,
    sortDirection: SortDirection.Desc,
    withUnreadNotificationCount: true,
  };

  private _pagedNotificationsTask = toSignal(
    merge(
      this._loadMoreNotificationsSubject.pipe(
        tap(() => (this._queryParams.pageNumber += 1)),
        switchMap(() =>
          this.getPagedNotifications(this._queryParams).pipe(
            tap((response) => {
              this._notifications.update((current) => {
                if (current) {
                  current.push(...response.data);
                  return current;
                }

                this._notificationHubService.connect();
                return response.data;
              });

              if (
                this._queryParams.withUnreadNotificationCount &&
                response.unreadNotificationCount
              ) {
                this._unreadNotificationCount.set(
                  response.unreadNotificationCount
                );
              }

              this._isNextNotificationsPage.set(response.isNext);
            })
          )
        )
      ),
      this._notificationHubService.notification$.pipe(
        tap((notification) => {
          this._notifications.update((current) => {
            if (current) {
              return [notification, ...current];
            }

            return [notification];
          });

          if (!notification.isRead) {
            this._unreadNotificationCount.update((current) =>
              current ? current + 1 : 1
            );
          }
        })
      )
    )
  );

  getPagedNotifications(queryParams: GetPagedNotificationsQueryParams) {
    return this._client.get<GetPagedNotificationsResponse>(
      `${this._urlBuilderService.buildUrl(this._baseUrl, queryParams)}`
    );
  }

  triggerSetAsReadNotification(id: string) {
    this._setAsReadNotificationSubject.next(id);
  }

  triggerSetAllNotificationsAsRead() {
    this._setAllNotificationsAsReadSubject.next();
  }

  loadMoreNotifications() {
    this._loadMoreNotificationsSubject.next();
  }

  setAsReadNotification(id: string) {
    this._isSetNotificationAsReadProcess.set(true);

    return this._client
      .patch<ApiResponse<ValueData<number>>>(
        `${this._baseUrl}/${id}`,
        undefined
      )
      .pipe(
        tap((response) => {
          this._notifications.update((notifiactions) => {
            const notification = notifiactions?.find((n) => n.id === id);

            if (notification) {
              notification.isRead = true;
            }

            return notifiactions;
          });

          this._unreadNotificationCount.set(response.data.value);
        }),
        finalize(() => this._isSetNotificationAsReadProcess.set(false))
      );
  }

  setAllNotificationsAsRead() {
    this._isSetNotificationAsReadProcess.set(true);

    return this._client
      .patch<ApiResponse<ValueData<number>>>(this._baseUrl, undefined)
      .pipe(
        tap((response) => {
          this._notifications.update((notifiactions) =>
            notifiactions?.map((notifiaction) => {
              notifiaction.isRead = true;
              return notifiaction;
            })
          );

          this._unreadNotificationCount.set(response.data.value);
        }),
        finalize(() => this._isSetNotificationAsReadProcess.set(false))
      );
  }
}
