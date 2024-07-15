import { Component, inject, model } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notification-mobile-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: 'notification-mobile-button.component.html',
})
export class NotificationMobileButtonComponent {
  private readonly _notificationService = inject(NotificationService);

  readonly unreadNotificationsCount =
    this._notificationService.unreadNotificationsCount;
  readonly opened = model.required<boolean>();
}
