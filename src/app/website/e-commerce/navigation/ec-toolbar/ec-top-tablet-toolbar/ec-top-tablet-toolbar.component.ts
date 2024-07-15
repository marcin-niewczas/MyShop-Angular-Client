import { Component, inject, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EcAuthButtonComponent } from '../../buttons/ec-auth-button/ec-auth-button.component';
import { EcCategoryDesktopMenuButtonComponent } from '../../buttons/ec-category-desktop-menu-button/ec-category-desktop-menu-button.component';
import { EcSearchButtonComponent } from '../../buttons/ec-search-button/ec-search-button.component';
import { EcShoppingCartButtonComponent } from '../../buttons/ec-shopping-cart-button/ec-shopping-cart-button.component';
import {
  ECommerceRouteSection,
  ECommerceRouteService,
} from '../../../services/ecommerce-route.service';
import { ThemeIconButtonComponent } from '../../../../../../themes/theme-buttons/theme-icon-button.component';
import { AccountAvatarMobileButtonComponent } from '../../../../../shared/components/account-avatar-button/account-avatar-mobile-button/account-avatar-mobile-button.component';
import { NotificationMobileButtonComponent } from '../../../../../shared/components/notification-button/notification-mobile-button/notification-mobile-button.component';
import { ShowHideScrollToolbarDirective } from '../../../../../shared/directives/show-hide-scroll-toolbar.directive';
import { AuthService } from '../../../../authenticate/auth.service';

@Component({
  selector: 'app-ec-top-tablet-toolbar',
  standalone: true,
  imports: [
    EcShoppingCartButtonComponent,
    EcSearchButtonComponent,
    RouterLink,
    EcAuthButtonComponent,
    EcCategoryDesktopMenuButtonComponent,
    NotificationMobileButtonComponent,
    AccountAvatarMobileButtonComponent,
    ShowHideScrollToolbarDirective,
    ThemeIconButtonComponent,
  ],
  templateUrl: './ec-top-tablet-toolbar.component.html',
  styleUrl: '../ec-toolbar.component.scss',
})
export class EcTopTabletToolbarComponent {
  private readonly _authService = inject(AuthService);
  private readonly _eCommerceRouteService = inject(ECommerceRouteService);

  readonly notificationOpened = model.required<boolean>();
  readonly userMenuOpened = model.required<boolean>();
  readonly categoryMenuOpened = model.required<boolean>();
  readonly searchOpened = model.required<boolean>();
  readonly showElevation = input<boolean>();

  readonly hasCustomerPermission = this._authService.hasCustomerPermission;

  readonly eCommerceRouteSection =
    this._eCommerceRouteService.currentRouteSection;

  readonly ECommerceRouteSection = ECommerceRouteSection;
}
