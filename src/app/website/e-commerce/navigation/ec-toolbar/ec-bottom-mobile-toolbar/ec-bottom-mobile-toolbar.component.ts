import { Component, inject, model } from '@angular/core';
import { EcShoppingCartButtonComponent } from '../../buttons/ec-shopping-cart-button/ec-shopping-cart-button.component';

import {
  ECommerceRouteSection,
  ECommerceRouteService,
} from '../../../services/ecommerce-route.service';
import { ThemeIconButtonComponent } from '../../../../../../themes/theme-buttons/theme-icon-button.component';
import { AccountAvatarMobileButtonComponent } from '../../../../../shared/components/account-avatar-button/account-avatar-mobile-button/account-avatar-mobile-button.component';
import { NotificationMobileButtonComponent } from '../../../../../shared/components/notification-button/notification-mobile-button/notification-mobile-button.component';
import { AuthService } from '../../../../authenticate/auth.service';
import { EcAuthButtonComponent } from '../../buttons/ec-auth-button/ec-auth-button.component';

@Component({
  selector: 'app-ec-mobile-bottom-toolbar',
  standalone: true,
  imports: [
    NotificationMobileButtonComponent,
    AccountAvatarMobileButtonComponent,
    EcShoppingCartButtonComponent,
    EcAuthButtonComponent,
    ThemeIconButtonComponent,
  ],
  templateUrl: './ec-bottom-mobile-toolbar.component.html',
  styleUrl: '../ec-toolbar.component.scss',
})
export class EcBottomMobileToolbarComponent {
  private readonly _authService = inject(AuthService);
  private readonly _eCommerceRouteService = inject(ECommerceRouteService);

  readonly notificationOpened = model.required<boolean>();
  readonly userMenuOpened = model.required<boolean>();

  readonly hasCustomerPermission = this._authService.hasCustomerPermission;

  readonly eCommerceRouteSection =
    this._eCommerceRouteService.currentRouteSection;

  readonly ECommerceRouteSection = ECommerceRouteSection;
}
