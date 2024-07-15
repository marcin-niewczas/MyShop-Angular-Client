import { Component, inject, input, model } from '@angular/core';
import { EcSearchButtonComponent } from '../../buttons/ec-search-button/ec-search-button.component';
import { EcShoppingCartButtonComponent } from '../../buttons/ec-shopping-cart-button/ec-shopping-cart-button.component';
import { RouterLink } from '@angular/router';
import { EcAuthButtonComponent } from '../../buttons/ec-auth-button/ec-auth-button.component';
import { EcCategoryDesktopMenuButtonComponent } from '../../buttons/ec-category-desktop-menu-button/ec-category-desktop-menu-button.component';
import {
  ECommerceRouteSection,
  ECommerceRouteService,
} from '../../../services/ecommerce-route.service';
import { ThemeIconButtonComponent } from '../../../../../../themes/theme-buttons/theme-icon-button.component';
import { AccountAvatarDesktopButtonComponent } from '../../../../../shared/components/account-avatar-button/account-avatar-desktop-button/account-avatar-desktop-button.component';
import { NotificationDesktopButtonComponent } from '../../../../../shared/components/notification-button/notification-desktop-button/notification-desktop-button.component';
import { AppRouteSection } from '../../../../../shared/models/others/app-route-section.enum';
import { AuthService } from '../../../../authenticate/auth.service';

@Component({
  selector: 'app-ec-top-desktop-toolbar',
  standalone: true,
  imports: [
    EcShoppingCartButtonComponent,
    EcSearchButtonComponent,
    RouterLink,
    EcAuthButtonComponent,
    EcCategoryDesktopMenuButtonComponent,
    NotificationDesktopButtonComponent,
    AccountAvatarDesktopButtonComponent,
    ThemeIconButtonComponent,
  ],
  templateUrl: './ec-top-desktop-toolbar.component.html',
  styleUrl: '../ec-toolbar.component.scss',
})
export class EcTopDesktopToolbarComponent {
  private readonly _authService = inject(AuthService);
  private readonly _eCommerceRouteService = inject(ECommerceRouteService);

  readonly notificationOpened = model.required<boolean>();
  readonly userMenuOpened = model.required<boolean>();
  readonly categoryMenuOpened = model.required<boolean>();
  readonly searchOpened = model.required<boolean>();

  readonly eCommerceRouteSection =
    this._eCommerceRouteService.currentRouteSection;

  readonly ECommerceRouteSection = ECommerceRouteSection;

  readonly hasCustomerPermission = this._authService.hasCustomerPermission;

  readonly showElevation = input<boolean>();

  readonly AppRouteSection = AppRouteSection;
}
