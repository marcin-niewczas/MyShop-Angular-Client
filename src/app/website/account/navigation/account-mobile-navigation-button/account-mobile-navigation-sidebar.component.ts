import { Component, inject, model } from '@angular/core';
import { AccountNavigationListComponent } from '../account-navigation-list/account-navigation-list.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseNavCloseSidebar } from '../../../../shared/components/sidebar/base-nav-close-sidebar.class';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';

@Component({
  selector: 'app-account-mobile-navigation-sidebar',
  standalone: true,
  imports: [
    SidebarComponent,
    AccountNavigationListComponent,
    MatIconModule,
    MatButtonModule,
  ],
  template: `<app-sidebar
    [side]="isXSmallScreen() ? 'bottom' : 'right'"
    [height]="isXSmallScreen() ? '' : '100%'"
    [maxWidth]="isXSmallScreen() ? '100%' : '400px'"
    [width]="isXSmallScreen() ? '100%' : '70%'"
    blockScroll
    [(opened)]="opened"
    borderCornerRadius
    [closeSwipeForBottomSidebar]="isXSmallScreen()"
  >
    @if (isXSmallScreen()) {
      <div class="header-xsmall" sidebar-header>
        <h3>Menu</h3>
      </div>
    } @else {
      <div class="header-small" sidebar-header>
        <h3>Menu</h3>
        <button mat-icon-button (click)="opened.set(false)">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    }
    <div sidebar-content>
      <app-account-navigation-list
        (clickedNavItem)="clickedNavItemSubject.next()"
      ></app-account-navigation-list>
    </div>
  </app-sidebar>`,
  styles: `
    .header-xsmall {
      h3 {
        text-align: center;
        font-size: 2rem;
      }
    }

    .header-small {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;

      h3 {
        font-size: 2rem;
      }
    }
  `,
})
export class AccountMobileNavigationSidebarComponent extends BaseNavCloseSidebar {
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );

  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;
  override readonly opened = model.required<boolean>();
}
