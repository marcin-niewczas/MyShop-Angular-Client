import { Routes } from '@angular/router';
import {
  accountAddressCreateResolver,
  accountAddressUpdateResolver,
} from './account-addresses/account-address-create-update/account-address.resolver';
import { AccountAddressComponentType } from './account-addresses/account-address-create-update/account-address-create-update.component';
import { accountUserInfoUpdateResolver } from './account-detail/account-user-info-update/account-user-info-update.resolver';
import { accountAddressValidatorParametersResolver } from './account-addresses/account-address-validator-paramters.resolver';
import { accountSecurityValidatorParametersResolver } from './account-security/account-security-validator-parameters.resolver';
import { accountPagedOrdersResolver } from './account-orders/account-paged-orders.resolver';
import { InvalidFiltersParametersData } from '../../shared/components/invalid-filters-parameters/invalid-filters-parameters-data.class';
import { accountPagedFavoritesResolver } from './account-favorites/account-paged-favorites.resolver';
import { ecOrderSummaryResolver } from '../e-commerce/ec-order-summary/ec-order-summary.resolver';

export const ACCOUNT_ROUTES: Routes = [
  { path: '', redirectTo: '/account/info', pathMatch: 'full' },
  {
    path: 'info',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../account/account-detail/account-detail.component').then(
            (mod) => mod.AccountDetailComponent,
          ),
        title: 'Account Settings',
      },
      {
        path: 'update',
        loadComponent: () =>
          import(
            '../account/account-detail/account-user-info-update/account-user-info-update.component'
          ).then((mod) => mod.AccountUserInfoUpdateComponent),
        title: 'Update Account Info',
        resolve: [accountUserInfoUpdateResolver],
      },
    ],
  },
  {
    path: 'addresses',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../account/account-addresses/account-addresses.component'
          ).then((mod) => mod.AccountAddressesComponent),
        title: 'Addresses',
        resolve: [accountAddressValidatorParametersResolver],
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './account-addresses/account-address-create-update/account-address-create-update.component'
          ).then((mod) => mod.AccountAddressCreateUpdateComponent),
        title: 'Create Address',
        data: { mode: AccountAddressComponentType.Create },
        resolve: [accountAddressCreateResolver],
      },
      {
        path: ':addressId/update',
        resolve: { address: accountAddressUpdateResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './account-addresses/account-address-create-update/account-address-create-update.component'
              ).then((mod) => mod.AccountAddressCreateUpdateComponent),
            data: { mode: AccountAddressComponentType.Update },
            title: (route) =>
              `Update ${route.parent?.data['address'].userAddressName} Address`,
          },
        ],
      },
    ],
  },
  {
    path: 'orders',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../account/account-orders/account-orders.component').then(
            (mod) => mod.AccountOrdersComponent,
          ),
        title: 'My Orders',
        resolve: { acPagedOrdersResolvedData: accountPagedOrdersResolver },
      },
      {
        path: ':orderId/details',
        resolve: { order: ecOrderSummaryResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                '../account/account-orders/account-order-detail/account-order-detail.component'
              ).then((mod) => mod.AccountOrderDetailComponent),
            title: (route) => `Order ${route.parent?.data['order'].id}`,
          },
        ],
      },
      {
        path: InvalidFiltersParametersData.urlPath,
        loadComponent: () =>
          import(
            '../../shared/components/invalid-filters-parameters/invalid-filters-parameters.component'
          ).then((mod) => mod.InvalidFiltersParametersComponent),
        title: 'Invalid Filters Parameters Orders',
        data: {
          invalidFiltersParametersData: new InvalidFiltersParametersData(
            'Return to Orders',
            '/account/orders',
            'shopping_bag',
          ),
        },
      },
    ],
  },
  {
    path: 'security',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../account/account-security/account-security.component').then(
            (mod) => mod.AccountSecurityComponent,
          ),
        title: 'Security',
      },
      {
        path: 'email/update',
        loadComponent: () =>
          import(
            '../account/account-security/account-security-update-email/account-security-update-email.component'
          ).then((mod) => mod.AccountSecurityUpdateEmailComponent),
        title: 'Update E-mail',
        resolve: [accountSecurityValidatorParametersResolver],
      },
      {
        path: 'password/update',
        loadComponent: () =>
          import(
            '../account/account-security/account-security-update-password/account-security-update-password.component'
          ).then((mod) => mod.AccountSecurityUpdatePasswordComponent),
        title: 'Update Password',
        resolve: [accountSecurityValidatorParametersResolver],
      },
    ],
  },
  {
    path: 'favorites',
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../account/account-favorites/account-favorites.component'
          ).then((mod) => mod.AccountFavoritesComponent),
        title: 'My Favorites',
        resolve: { resolvedDataOfPagedFavoritesAc: accountPagedFavoritesResolver },
      },
      {
        path: InvalidFiltersParametersData.urlPath,
        loadComponent: () =>
          import(
            '../../shared/components/invalid-filters-parameters/invalid-filters-parameters.component'
          ).then((mod) => mod.InvalidFiltersParametersComponent),
        title: 'Invalid Filters Parameters Orders',
        data: {
          invalidFiltersParametersData: new InvalidFiltersParametersData(
            'Return to Favorites',
            '/account/favorites',
            'favorite',
          ),
        },
      },
    ],
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import(
        '../account/account-notifications/account-notifications.component'
      ).then((mod) => mod.AccountNotificationsComponent),
    title: 'Notifications',
  },
];
