import { Component, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { LogoutProcessPlaceholderComponent } from './logout-process-placeholder/logout-process-placeholder.component';
import { ThemeListItemButtonComponent } from '../../../../../themes/theme-buttons/theme-list-item-button.component';
import { LogoutProcessPlaceholderService } from './logout-process-placeholder/logout-process-placeholder.service';
import { AppRouteSection } from '../../../models/others/app-route-section.enum';
import { AuthService } from '../../../../website/authenticate/auth.service';

@Component({
  selector: 'app-user-menu-nav-list',
  standalone: true,
  imports: [
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    MatRippleModule,
    NgTemplateOutlet,
    LogoutProcessPlaceholderComponent,
    ThemeListItemButtonComponent,
  ],
  templateUrl: './user-menu-nav-list.component.html',
  styleUrl: './user-menu-nav-list.component.scss',
})
export class UserMenuNavListComponent {
  private readonly _logoutProcessPlaceholderService = inject(
    LogoutProcessPlaceholderService,
  );
  private readonly _authService = inject(AuthService);

  readonly hasEmployeePermission = this._authService.hasEmployeePermission;
  readonly hasCustomerPermission = this._authService.hasCustomerPermission;
  readonly appRouteSection = input.required<AppRouteSection>();

  readonly AppRouteSection = AppRouteSection;

  logoutUser() {
    this._logoutProcessPlaceholderService.startLogout();
  }
}
