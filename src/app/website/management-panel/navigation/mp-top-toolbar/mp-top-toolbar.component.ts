import { Component, OnInit, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { fromEvent, debounceTime, map } from 'rxjs';
import { AccountAvatarDesktopButtonComponent } from '../../../../shared/components/account-avatar-button/account-avatar-desktop-button/account-avatar-desktop-button.component';
import { AccountAvatarMobileButtonComponent } from '../../../../shared/components/account-avatar-button/account-avatar-mobile-button/account-avatar-mobile-button.component';
import {
  inOutAnimation,
  inAnimation,
} from '../../../../shared/components/animations';
import { NotificationDesktopButtonComponent } from '../../../../shared/components/notification-button/notification-desktop-button/notification-desktop-button.component';
import { NotificationMobileButtonComponent } from '../../../../shared/components/notification-button/notification-mobile-button/notification-mobile-button.component';
import { smoothScrollToTop } from '../../../../shared/functions/scroll-functions';
import { AppRouteSection } from '../../../../shared/models/others/app-route-section.enum';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { ToolbarMpService } from './toolbar-mp.service';

@Component({
  selector: 'app-mp-top-toolbar',
  standalone: true,
  imports: [
    MatButtonModule,
    FontAwesomeModule,
    MatIconModule,
    AccountAvatarMobileButtonComponent,
    NotificationMobileButtonComponent,
    AccountAvatarDesktopButtonComponent,
    NotificationDesktopButtonComponent,
    RouterLink,
  ],
  templateUrl: './mp-top-toolbar.component.html',
  styleUrl: './mp-top-toolbar.component.scss',
  animations: [inOutAnimation, inAnimation],
})
export class MpTopToolbarComponent implements OnInit {
  private readonly _toolbarMpService = inject(ToolbarMpService);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );

  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;
  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;
  readonly notificationOpened = signal(false);
  readonly userMenuOpened = signal(false);

  readonly desktopNavOpened = signal(true);
  readonly mobileNavOpened = signal(false);

  readonly smoothScrollToTop = smoothScrollToTop;

  readonly AppRouteSection = AppRouteSection;

  readonly faChartLine = faChartLine;

  readonly label = toSignal(
    fromEvent(window, 'scroll').pipe(
      debounceTime(100),
      map(() =>
        window.scrollY < 50 ? undefined : this._toolbarMpService.routeLabel(),
      ),
    ),
  );

  private readonly _openedStateKey =
    'management-panel-navigation-side-menu-opened';

  ngOnInit(): void {
    this.desktopNavOpened.set(this.getDesktopSidebarOpenedState());
  }

  private setDesktopSidebarOpenedState() {
    localStorage.setItem(
      this._openedStateKey,
      JSON.stringify(this.desktopNavOpened()),
    );
  }

  private getDesktopSidebarOpenedState() {
    const value = localStorage.getItem(this._openedStateKey);

    if (value === 'false') {
      return false;
    }

    return true;
  }

  toggleDesktopSidebarOpened() {
    this.desktopNavOpened.set(!this.desktopNavOpened());
    this.setDesktopSidebarOpenedState();
  }
}
