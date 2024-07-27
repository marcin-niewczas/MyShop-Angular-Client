import { Routes } from '@angular/router';
import { FavoriteAcService } from './account/services/favorite-ac.service';
import { UserAcService } from './account/services/user-ac.service';
import { UserAddressAcService } from './account/services/user-address-ac.service';
import { authorizationGuard } from './authenticate/authorization.guard';
import { isAuthResolver } from './authenticate/is-auth.resolver';
import { CategoryEcService } from './e-commerce/services/category-ec.service';
import { ECommerceRouteService } from './e-commerce/services/ecommerce-route.service';
import { FavoriteEcService } from './e-commerce/services/favorite-ec.service';
import { MainPageSectionEcService } from './e-commerce/services/main-page-section-ec.service';
import { ShoppingCartEcService } from './e-commerce/services/shopping-cart-ec.service';
import { managementPanelGuard } from './management-panel/mp.guard';
import { ToolbarMpService } from './management-panel/navigation/mp-top-toolbar/toolbar-mp.service';
import { CategoryMpService } from './management-panel/services/category-mp.service';
import { DashboardMpService } from './management-panel/services/dashboard-mp.service';
import { MainPageSectionMpService } from './management-panel/services/main-page-section-mp.service';
import { OrderMpService } from './management-panel/services/order-mp.service';
import { PhotoMpService } from './management-panel/services/photo-mp.service';
import { ProductMpService } from './management-panel/services/product-mp.service';
import { ProductOptionMpService } from './management-panel/services/product-option-mp.service';
import { ProductOptionValueMpService } from './management-panel/services/product-option-value-mp.service';
import { ProductProductDetailOptionValueMpService } from './management-panel/services/product-product-detail-option-value-mp.service';
import { ProductReviewMpService } from './management-panel/services/product-review-mp.service';
import { ProductVariantMpService } from './management-panel/services/product-variant-mp.service';

export const WEBSITE_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./e-commerce/e-commerce.routes').then(
        (mod) => mod.E_COMMERCE_ROUTES,
      ),
    title: 'myShop',
    providers: [
      CategoryEcService,
      ShoppingCartEcService,
      ECommerceRouteService,
      FavoriteEcService,
      MainPageSectionEcService,
    ],
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./account/account.component').then((mod) => mod.AccountComponent),
    loadChildren: () =>
      import('./account/account.routes').then((mod) => mod.ACCOUNT_ROUTES),
    canMatch: [authorizationGuard],
    providers: [UserAcService, UserAddressAcService, FavoriteAcService],
  },
  {
    path: 'authenticate',
    loadChildren: () =>
      import('./authenticate/auth.routes').then((mod) => mod.AUTH_ROUTES),
    resolve: { authResolver: isAuthResolver },
    title: 'Sign In/Sign Up',
  },
  {
    path: 'management-panel',
    loadComponent: () =>
      import('./management-panel/mp-main.component').then(
        (mod) => mod.MpMainComponent,
      ),
    loadChildren: () =>
      import('./management-panel/mp.routes').then(
        (mod) => mod.MANAGEMENT_PANEL_ROUTES,
      ),
    canMatch: [managementPanelGuard],
    providers: [
      DashboardMpService,
      CategoryMpService,
      ProductMpService,
      ProductVariantMpService,
      ProductOptionMpService,
      ProductOptionValueMpService,
      ToolbarMpService,
      OrderMpService,
      ProductReviewMpService,
      MainPageSectionMpService,
      PhotoMpService,
      ProductProductDetailOptionValueMpService,
    ],
  },
];
