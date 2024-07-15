import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AccountDesktopNavigationComponent } from './navigation/account-desktop-navigation/account-desktop-navigation.component';
import { AccountTopToolbarComponent } from './navigation/account-top-toolbar/account-top-toolbar.component';
import { SidebarMobileUserMenuComponent } from '../../shared/components/account-avatar-button/account-avatar-mobile-button/sidebar-mobile-user-menu/sidebar-mobile-user-menu.component';
import { inAnimation } from '../../shared/components/animations';
import { SidebarMobileNotificationComponent } from '../../shared/components/notification-button/notification-mobile-button/sidebar-mobile-notification/sidebar-mobile-notification.component';
import { AppRouteSection } from '../../shared/models/others/app-route-section.enum';
import { BreakpointObserverService } from '../../shared/services/breakpoint-observer.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    RouterOutlet,
    AccountDesktopNavigationComponent,
    AccountTopToolbarComponent,
    SidebarMobileNotificationComponent,
    SidebarMobileUserMenuComponent,
    RouterModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
  animations: [inAnimation],
})
export class AccountComponent {
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;
  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;

  readonly AppRouteSection = AppRouteSection;
}
