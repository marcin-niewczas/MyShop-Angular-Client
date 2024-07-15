import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AccountMobileNavigationButtonComponent } from '../account-mobile-navigation-button/account-mobile-navigation-button.component';
import { AccountAvatarDesktopButtonComponent } from '../../../../shared/components/account-avatar-button/account-avatar-desktop-button/account-avatar-desktop-button.component';
import { AccountAvatarMobileButtonComponent } from '../../../../shared/components/account-avatar-button/account-avatar-mobile-button/account-avatar-mobile-button.component';
import { NotificationDesktopButtonComponent } from '../../../../shared/components/notification-button/notification-desktop-button/notification-desktop-button.component';
import { NotificationMobileButtonComponent } from '../../../../shared/components/notification-button/notification-mobile-button/notification-mobile-button.component';
import { AppRouteSection } from '../../../../shared/models/others/app-route-section.enum';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';

@Component({
  selector: 'app-account-top-toolbar',
  standalone: true,
  imports: [
    AccountAvatarMobileButtonComponent,
    NotificationMobileButtonComponent,
    AccountAvatarDesktopButtonComponent,
    NotificationDesktopButtonComponent,
    AccountMobileNavigationButtonComponent,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ],
  templateUrl: './account-top-toolbar.component.html',
  styleUrl: './account-top-toolbar.component.scss',
})
export class AccountTopToolbarComponent {
  readonly AppRouteSection = AppRouteSection;
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );

  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;
  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;

  readonly notificationOpened = signal(false);
  readonly userMenuOpened = signal(false);
}
