import { Component, inject, model } from '@angular/core';
import { EcSidebarCategoryMenuComponent } from './ec-sidebar-category-menu/ec-sidebar-category-menu.component';
import { EcSidebarSearchComponent } from './ec-sidebar-search/ec-sidebar-search.component';
import { EcSidebarShoppingCartComponent } from './ec-sidebar-shopping-cart/ec-sidebar-shopping-cart.component';
import {
  ECommerceRouteSection,
  ECommerceRouteService,
} from '../../services/ecommerce-route.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ShoppingCartEcService } from '../../services/shopping-cart-ec.service';
import { SidebarMobileUserMenuComponent } from '../../../../shared/components/account-avatar-button/account-avatar-mobile-button/sidebar-mobile-user-menu/sidebar-mobile-user-menu.component';
import { SidebarMobileNotificationComponent } from '../../../../shared/components/notification-button/notification-mobile-button/sidebar-mobile-notification/sidebar-mobile-notification.component';
import { AppRouteSection } from '../../../../shared/models/others/app-route-section.enum';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { AuthService } from '../../../authenticate/auth.service';

@Component({
  selector: 'app-ec-sidebars',
  standalone: true,
  imports: [
    EcSidebarCategoryMenuComponent,
    EcSidebarSearchComponent,
    EcSidebarShoppingCartComponent,
    SidebarMobileNotificationComponent,
    SidebarMobileUserMenuComponent,
  ],
  templateUrl: './ec-sidebars.component.html',
})
export class EcSidebarsComponent {
  private readonly _authService = inject(AuthService);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _eCommerceRouteService = inject(ECommerceRouteService);
  private readonly _shoppingCartEcService = inject(ShoppingCartEcService);

  readonly hasCustomerPermission = this._authService.hasCustomerPermission;

  readonly notificationOpened = model.required<boolean>();
  readonly userMenuOpened = model.required<boolean>();
  readonly categoryMenuOpened = model.required<boolean>();
  readonly searchOpened = model.required<boolean>();

  readonly AppRouteSection = AppRouteSection;
  readonly isLargeScreen = this._breakpointObserverService.isLargeScreen;

  private _currentECommerceRouteSection = toSignal(
    this._eCommerceRouteService.currentRouteSection$.pipe(
      map((routeSection) => {
        switch (routeSection) {
          case ECommerceRouteSection.OrderSummaries:
          case ECommerceRouteSection.OrderStepper:
            this.closeAllSidebars();
            break;
        }

        return routeSection;
      }),
    ),
  );

  private closeAllSidebars() {
    this.notificationOpened.set(false);
    this.userMenuOpened.set(false);
    this.categoryMenuOpened.set(false);
    this._shoppingCartEcService.shoppingCartOpened.set(false);
    this.searchOpened.set(false);
  }
}
