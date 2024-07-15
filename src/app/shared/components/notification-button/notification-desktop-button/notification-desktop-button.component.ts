import { Component, model } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { inOutAnimation } from '../../animations';
import { LoadingComponent } from '../../loading/loading.component';
import { NotificationListComponent } from '../notification-list/notification-list.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-desktop-button',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    NotificationListComponent,
    InfiniteScrollDirective,
    RouterLink,
    LoadingComponent,
  ],
  templateUrl: './notification-desktop-button.component.html',
  styleUrl: './notification-desktop-button.component.scss',
  animations: [inOutAnimation],
})
export class NotificationDesktopButtonComponent {
  readonly unreadNotificationsCount =
    this._notificationService.unreadNotificationsCount;
  readonly opened = model.required<boolean>();

  readonly isSetNotificationAsReadProcess =
    this._notificationService.isSetNotificationAsReadProcess;

  readonly isLoadMoreNotificationsProcess =
    this._notificationService.isLoadMoreNotificationsProcess;
  readonly isNextNotificationsPage =
    this._notificationService.isNextNotificationsPage;

  constructor(private readonly _notificationService: NotificationService) {}

  setAllNotificationsAsRead() {
    if (
      this.unreadNotificationsCount() != undefined &&
      this.unreadNotificationsCount()! > 0 &&
      !this.isSetNotificationAsReadProcess() &&
      !this.isLoadMoreNotificationsProcess()
    ) {
      this._notificationService.triggerSetAllNotificationsAsRead();
    }
  }

  loadMoreNotifications() {
    this._notificationService.loadMoreNotifications();
  }
}
