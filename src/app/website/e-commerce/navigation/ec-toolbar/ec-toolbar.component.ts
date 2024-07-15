import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { fromEvent, debounceTime, map } from 'rxjs';
import { Router } from '@angular/router';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { EcBottomMobileToolbarComponent } from './ec-bottom-mobile-toolbar/ec-bottom-mobile-toolbar.component';
import { EcTopDesktopToolbarComponent } from './ec-top-desktop-toolbar/ec-top-desktop-toolbar.component';
import { EcTopMobileToolbarComponent } from './ec-top-mobile-toolbar/ec-top-mobile-toolbar.component';
import { EcTopTabletToolbarComponent } from './ec-top-tablet-toolbar/ec-top-tablet-toolbar.component';

@Component({
  selector: 'app-ec-toolbar',
  standalone: true,
  imports: [
    EcTopMobileToolbarComponent,
    EcBottomMobileToolbarComponent,
    EcTopDesktopToolbarComponent,
    EcTopTabletToolbarComponent,
  ],
  template: `@if (isXSmallScreen()) {
      <app-ec-top-mobile-toolbar
        [(searchOpened)]="searchOpened"
        [(categoryMenuOpened)]="categoryMenuOpened"
        [showElevation]="showElevation()"
      ></app-ec-top-mobile-toolbar>
      <app-ec-mobile-bottom-toolbar
        [(notificationOpened)]="notificationOpened"
        [(userMenuOpened)]="userMenuOpened"
      ></app-ec-mobile-bottom-toolbar>
    } @else if (!isLargeScreen()) {
      <app-ec-top-tablet-toolbar
        [showElevation]="showElevation()"
        [(categoryMenuOpened)]="categoryMenuOpened"
        [(searchOpened)]="searchOpened"
        [(notificationOpened)]="notificationOpened"
        [(userMenuOpened)]="userMenuOpened"
      ></app-ec-top-tablet-toolbar>
    } @else {
      <app-ec-top-desktop-toolbar
        [showElevation]="showElevation()"
        [(categoryMenuOpened)]="categoryMenuOpened"
        [(searchOpened)]="searchOpened"
        [(notificationOpened)]="notificationOpened"
        [(userMenuOpened)]="userMenuOpened"
      ></app-ec-top-desktop-toolbar>
    } `,
  styleUrl: './ec-toolbar.component.scss',
})
export class EcToolbarComponent {
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _router = inject(Router);

  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;
  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;

  readonly notificationOpened = signal(false);
  readonly userMenuOpened = signal(false);
  readonly categoryMenuOpened = signal(false);
  readonly shoppingCartOpened = signal(true);
  readonly searchOpened = signal(false);

  readonly showElevation = toSignal(
    fromEvent(window, 'scroll').pipe(
      debounceTime(100),
      map(() => {
        if (this._router.url.startsWith('/categories')) {
          return false;
        }

        return window.scrollY > 50;
      }),
    ),
  );
}
