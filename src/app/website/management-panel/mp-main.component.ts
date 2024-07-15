import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarMobileUserMenuComponent } from '../../shared/components/account-avatar-button/account-avatar-mobile-button/sidebar-mobile-user-menu/sidebar-mobile-user-menu.component';
import { SidebarMobileNotificationComponent } from '../../shared/components/notification-button/notification-mobile-button/sidebar-mobile-notification/sidebar-mobile-notification.component';
import { AppRouteSection } from '../../shared/models/others/app-route-section.enum';
import { BreakpointObserverService } from '../../shared/services/breakpoint-observer.service';
import { MpDesktopNavigationComponent } from './navigation/mp-desktop-navigation/mp-desktop-navigation.component';
import { MpMobileNavigationComponent } from './navigation/mp-mobile-navigation/mp-mobile-navigation.component';
import { MpTopToolbarComponent } from './navigation/mp-top-toolbar/mp-top-toolbar.component';

@Component({
  standalone: true,
  imports: [
    MpDesktopNavigationComponent,
    MpTopToolbarComponent,
    RouterOutlet,
    MpMobileNavigationComponent,
    SidebarMobileNotificationComponent,
    SidebarMobileUserMenuComponent,
  ],
  templateUrl: './mp-main.component.html',

  styleUrl: './mp-main.component.scss',
})
export class MpMainComponent {
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );

  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;
  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;

  readonly AppRouteSection = AppRouteSection;
}
