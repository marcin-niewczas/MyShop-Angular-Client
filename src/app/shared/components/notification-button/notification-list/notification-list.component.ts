import { trigger, transition, animate, style } from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component, inject, model } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { outAnimation } from '../../animations';
import { LoadingComponent } from '../../loading/loading.component';
import { BaseNavCloseSidebar } from '../../sidebar/base-nav-close-sidebar.class';
import {
  getNotificationIcon,
  getNotificationRouterLink,
  getNotificationTitle,
} from '../../../functions/notification-functions';
import { NotificationMessage } from '../../../models/notification/notification-message.interface';
import { NotificationType } from '../../../models/notification/notification-type.enum';
import { DateAgoPipe } from '../../../pipes/date-ago.pipe';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    LoadingComponent,
    MatIconModule,
    NgClass,
    RouterLink,
    DateAgoPipe,
    MatDividerModule,
  ],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss',
  animations: [
    outAnimation,
    trigger('unreadDotTrigger', [
      transition(':leave', [animate('.3s ease', style({ opacity: 0 }))]),
    ]),
  ],
})
export class NotificationListComponent extends BaseNavCloseSidebar {
  override opened = model.required<boolean>();

  private readonly _notificationService = inject(NotificationService);

  readonly notifications = this._notificationService.notifications;
  readonly NotificationType = NotificationType;

  readonly getNotificationIcon = getNotificationIcon;
  readonly getNotificationRouterLink = getNotificationRouterLink;
  readonly getNotificationTitle = getNotificationTitle;

  setAsReadNotification(notification: NotificationMessage) {
    if (!notification.isRead) {
      this._notificationService.triggerSetAsReadNotification(notification.id);
    }
  }

  clickNavItem(item?: NotificationMessage) {
    if (!item) {
      if (this._router.url === '/account/notifications') {
        this.opened.set(false);

        return;
      }
    }

    switch (item?.notificationType) {
      case NotificationType.Order: {
        if (this._router.url === `/account/orders/${item.resourceId}/details`) {
          this.opened.set(false);
        }

        return;
      }
      case NotificationType.Security: {
        if (this._router.url === '/account/security') {
          this.opened.set(false);
        }

        return;
      }
    }

    this.clickedNavItemSubject.next();
  }
}
