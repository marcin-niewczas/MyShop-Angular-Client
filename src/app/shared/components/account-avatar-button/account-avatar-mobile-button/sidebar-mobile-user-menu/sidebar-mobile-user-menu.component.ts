import { Component, inject, input, model } from '@angular/core';
import { UserMenuNavListComponent } from '../../user-menu-nav-list/user-menu-nav-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../../website/authenticate/auth.service';
import { AppRouteSection } from '../../../../models/others/app-route-section.enum';
import { BreakpointObserverService } from '../../../../services/breakpoint-observer.service';
import { inOutAnimation } from '../../../animations';
import { AvatarComponent } from '../../../avatar/avatar.component';
import { SidebarComponent } from '../../../sidebar/sidebar.component';

@Component({
  selector: 'app-sidebar-mobile-user-menu',
  standalone: true,
  imports: [
    SidebarComponent,
    AvatarComponent,
    UserMenuNavListComponent,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './sidebar-mobile-user-menu.component.html',
  styleUrl: './sidebar-mobile-user-menu.component.scss',
  animations: [inOutAnimation],
})
export class SidebarMobileUserMenuComponent {
  private readonly _authService = inject(AuthService);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService
  );

  readonly user = this._authService.currentUser;
  readonly opened = model.required<boolean>();
  readonly appRouteSection = input.required<AppRouteSection>();
  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;
}
