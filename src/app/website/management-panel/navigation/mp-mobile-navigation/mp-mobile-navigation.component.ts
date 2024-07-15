import { Component, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BaseNavCloseSidebar } from '../../../../shared/components/sidebar/base-nav-close-sidebar.class';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { AuthService } from '../../../authenticate/auth.service';
import { mpNavigationItems } from '../mp-navigation-items';

@Component({
  selector: 'app-mp-mobile-navigation',
  standalone: true,
  imports: [
    SidebarComponent,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './mp-mobile-navigation.component.html',
  styleUrl: './mp-mobile-navigation.component.scss',
})
export class MpMobileNavigationComponent extends BaseNavCloseSidebar {
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _authService = inject(AuthService);

  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;
  override readonly opened = model.required<boolean>();
  readonly mpNavigationItems = mpNavigationItems;

  readonly hasEmployeeManagerPermission =
    this._authService.hasEmployeeManagerPermission;
}
