import { Component, ElementRef, ViewChild, inject, model } from '@angular/core';
import { NotificationListComponent } from '../../notification-list/notification-list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { LoadingComponent } from '../../../loading/loading.component';
import { NgTemplateOutlet } from '@angular/common';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { BreakpointObserverService } from '../../../../services/breakpoint-observer.service';
import { NotificationService } from '../../../../services/notification.service';
import { SidebarComponent } from '../../../sidebar/sidebar.component';

@Component({
  selector: 'app-sidebar-mobile-notification',
  standalone: true,
  imports: [
    SidebarComponent,
    NotificationListComponent,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    InfiniteScrollDirective,
    LoadingComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './sidebar-mobile-notification.component.html',
  styleUrl: './sidebar-mobile-notification.component.scss',
})
export class SidebarMobileNotificationComponent {
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  private readonly _notificationService = inject(NotificationService);
  private readonly _router = inject(Router);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );

  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;

  readonly unreadNotificationsCount =
    this._notificationService.unreadNotificationsCount;
  readonly isSetNotificationAsReadProcess =
    this._notificationService.isSetNotificationAsReadProcess;

  readonly isLoadMoreNotificationsProcess =
    this._notificationService.isLoadMoreNotificationsProcess;
  readonly isNextNotificationsPage =
    this._notificationService.isNextNotificationsPage;

  readonly opened = model.required<boolean>();

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

  onOpenedChange(value: boolean) {
    if (!value) {
      setTimeout(() => (this.scrollContainer.nativeElement.scrollTop = 0), 300);
    }

    this.opened.set(value);
  }
}
