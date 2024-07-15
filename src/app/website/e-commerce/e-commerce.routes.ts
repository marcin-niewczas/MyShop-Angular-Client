import { Routes } from '@angular/router';
import { ecMainResolver } from './ec-main.resolver';
import {
  ProductsListResolvedData,
  ecProductListResolver,
} from './ec-products-list/ec-product-list.resolver';
import { AccordionOpenedEcService } from './ec-products-list/accordion-opened-ec.service';
import {
  ProductDetailEcResolverData,
  ecProductDetailResolver,
} from './ec-product-detail/ec-product-detail.resolver';
import { BaseProductDetailEc } from './models/product/product-detail-ec.interface';
import { UserAddressAcService } from '../account/services/user-address-ac.service';
import { ecOrderSummaryResolver } from './ec-order-summary/ec-order-summary.resolver';
import { ecCheckoutResolver } from './ec-order/ec-order.resolver';
import { ecMainPageSectionsResolver } from './ec-main-page-sections/ec-main-page-sections.resolver';
import { InvalidFiltersParametersData } from '../../shared/components/invalid-filters-parameters/invalid-filters-parameters-data.class';

export const E_COMMERCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ec-main.component').then((mod) => mod.EcMainComponent),
    resolve: [ecMainResolver],
    children: [
      {
        path: '',
        resolve: { resolvedData: ecMainPageSectionsResolver },
        loadComponent: () =>
          import(
            './ec-main-page-sections/ec-main-page-sections.component'
          ).then((mod) => mod.EcMainPageSectionsComponent),
      },
      {
        path: 'products/:encodedProductName',
        resolve: { productDetailResolverData: ecProductDetailResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                '../e-commerce/ec-product-detail/ec-product-detail.component'
              ).then((mod) => mod.EcProductDetailComponent),
            title: (route) =>
              `${((route.parent?.data['productDetailResolverData'] as ProductDetailEcResolverData).productDetail as BaseProductDetailEc).fullName}`,
          },
        ],
      },
      {
        path: 'categories/:encodedCategoryName',
        resolve: { productListResolvedData: ecProductListResolver },
        providers: [AccordionOpenedEcService],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./ec-products-list/ec-products-list.component').then(
                (mod) => mod.EcProductsListComponent,
              ),
            title: (route) =>
              `${(route.parent?.data['productListResolvedData'] as ProductsListResolvedData).productFilters.category.hierarchyName} Products`,
          },
        ],
      },
      {
        path: InvalidFiltersParametersData.urlPath,
        loadComponent: () =>
          import(
            './ec-product-list-invalid-filter-params/ec-product-list-invalid-filter-params.component'
          ).then((mod) => mod.EcProductListInvalidFilterParamsComponent),
        title: 'Invalid Filters Params',
      },
      {
        path: 'returns-policy',
        loadComponent: () =>
          import('./ec-returns-policy/ec-returns-policy.component').then(
            (mod) => mod.EcReturnsPolicyComponent,
          ),
        title: 'Returns Policy',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./ec-order/ec-order.component').then(
            (mod) => mod.EcOrderComponent,
          ),
        title: 'Order',
        resolve: { dataCheckoutId: ecCheckoutResolver },
        providers: [UserAddressAcService],
      },
      {
        path: 'orders/:orderId/summaries',
        loadComponent: () =>
          import('./ec-order-summary/ec-order-summary.component').then(
            (mod) => mod.EcOrderSummaryComponent,
          ),
        title: 'Order Summary',
        resolve: { order: ecOrderSummaryResolver },
      },
    ],
  },
];
