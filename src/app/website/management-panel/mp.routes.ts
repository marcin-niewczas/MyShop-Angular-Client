import { Routes } from '@angular/router';
import { mpProductOptionsResolver } from './mp-product-options/mp-product-options.resolver';
import {
  mpMainCategoryDetailResolver,
  mpSubcategoryDetailResolver,
} from './mp-main-categories/mp-main-category-hierarchy-tree/mp-category-detail/mp-category-detail.resolver';
import { CategoryHelperMpService } from './mp-main-categories/category-helper-mp.service';
import { mpCategoryHierarchyTreeResolver } from './mp-main-categories/mp-main-category-hierarchy-tree/mp-category-hierarchy-tree.resolver';
import { mpProductOptionDetailResolver } from './mp-product-options/mp-product-option-detail/mp-product-option-detail.resolver';
import { mpProductsResolver } from './mp-products/mp-products.resolver';
import {
  MpProductDetailResolvedData,
  mpProductDetailResolver,
} from './mp-products/mp-product-detail/mp-product-detail.resolver';
import { mpPagedOrdersResolver } from './mp-orders/mp-paged-orders.resolver';
import { mpOrderDetailResolver } from './mp-orders/mp-order-detail/mp-order-detail.resolver';
import { OrderDetailMp } from './models/order/order-detail-mp.interface';
import { mpOrderUpdateResolver } from './mp-orders/mp-order-detail/mp-order-update/mp-order-update.resolver';
import { OrderMp } from './models/order/order-mp.interface';
import { mpProductVariantCreateResolver } from './mp-products/mp-product-detail/mp-product-variant-create/mp-product-variant-create.resolver';
import { mpProductVariantUpdateResolver } from './mp-products/mp-product-detail/mp-product-variant-update/mp-product-variant-update.resolver';
import { ProductVariantMp } from './models/product-variant/product-variant-mp.interface';
import { mpMainPageSectionCreateResolver } from './mp-main-page-sections/mp-main-page-section-create/mp-main-page-section-create.resolver';
import {
  mpMainPageSectionDetailResolver,
  mpManPageSectionDetailTitleResolver,
} from './mp-main-page-sections/mp-main-page-section-detail/mp-main-page-section-detail.resolver';
import { mpWebsiteHeroSectionUpdateResolver } from './mp-main-page-sections/mp-main-page-section-detail/mp-website-hero-section-detail/mp-website-hero-section-update/mp-website-hero-section-update.resolver';
import { WebsiteHeroSectionMp } from './models/main-page-sections/main-page-section-mp.interface';
import { mpWebsiteHeroSectionItemCreateResolver } from './mp-main-page-sections/mp-main-page-section-detail/mp-website-hero-section-detail/mp-website-hero-section-item-create/mp-website-hero-section-item-create.resolver';
import { WebsiteHeroSectionItemMpService } from './mp-main-page-sections/mp-main-page-section-detail/mp-website-hero-section-detail/website-hero-section-item-mp.service';
import {
  MpProductDetailOptionsOfProductUpdateResolvedData,
  mpProductDetailOptionsOfProductUpdateResolver,
} from './mp-products/mp-product-detail/update-product-options/mp-product-detail-options-of-product-update/mp-product-detail-options-of-product-update.resolver';
import {
  MpProductVariantOptionsOfProductUpdateResolvedData,
  mpProductVariantOptionsOfProductUpdateResolver,
} from './mp-products/mp-product-detail/update-product-options/mp-product-variant-options-of-product-update/mp-product-variant-options-of-product-update.resolver';
import { ProductMp } from './models/product/product-mp.interface';
import { mpProductOptionCreateResolver } from './mp-product-options/mp-product-option-create/mp-product-option-create.resolver';
import { mpProductCreateResolver } from './mp-products/mp-product-create/mp-product-create.resolver';
import {
  MpWebsiteHeroSectionItemUpdateResolvedData,
  mpWebsiteHeroSectionItemUpdateResolver,
} from './mp-main-page-sections/mp-main-page-section-detail/mp-website-hero-section-detail/mp-website-hero-section-item-update/mp-website-hero-section-item-update.resolver';
import {
  MpProductVariantPhotosUpdateResolvedData,
  mpProductVariantPhotosUpdateResolver,
} from './mp-products/mp-product-detail/mp-product-variant-photos-update/mp-product-variant-photos-update.resolver';
import { InvalidFiltersParametersData } from '../../shared/components/invalid-filters-parameters/invalid-filters-parameters-data.class';
import { mpProductUpdateResolver } from './mp-products/mp-product-detail/mp-product-update/mp-product-update.resolver';

export const MANAGEMENT_PANEL_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./mp-dashboard/mp-dashboard.component').then(
        (mod) => mod.MpDashboardComponent,
      ),
    title: 'Dashboard',
    data: { routeLabel: 'Dashboard' },
  },

  {
    path: 'products',
    data: { routeLabel: 'Products' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./mp-products/mp-products.component').then(
            (mod) => mod.MpProductsComponent,
          ),
        title: 'Products',
        resolve: { products: mpProductsResolver },
      },
      {
        path: InvalidFiltersParametersData.urlPath,
        loadComponent: () =>
          import(
            '../../shared/components/invalid-filters-parameters/invalid-filters-parameters.component'
          ).then((mod) => mod.InvalidFiltersParametersComponent),
        title: 'Invalid Filters Parameters Product Options',
        data: {
          invalidFiltersParametersData: new InvalidFiltersParametersData(
            'Return to Products',
            '/management-panel/products',
            'styles',
          ),
        },
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './mp-products/mp-product-create/mp-product-create.component'
          ).then((mod) => mod.MpProductCreateComponent),
        title: 'Create Product',
        resolve: [mpProductCreateResolver],
      },
      {
        path: ':productId',
        resolve: { mpProductDetailResolvedData: mpProductDetailResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-products/mp-product-detail/mp-product-detail.component'
              ).then((mod) => mod.MpProductDetailComponent),
            title: (route) =>
              `${(route.parent?.data['mpProductDetailResolvedData'] as MpProductDetailResolvedData).product.fullName} - Product Detail`,
          },
        ],
      },

      {
        path: ':productId/update',
        resolve: { product: mpProductUpdateResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-products/mp-product-detail/mp-product-update/mp-product-update.component'
              ).then((mod) => mod.MpProductUpdateComponent),
            title: (route) =>
              `Update ${(route.parent?.data['product'] as ProductMp).fullName}`,
          },
        ],
      },

      {
        path: ':productId/product-detail-options/update',
        resolve: {
          mpProductDetailOptionsOfProductUpdateResolvedData:
            mpProductDetailOptionsOfProductUpdateResolver,
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-products/mp-product-detail/update-product-options/mp-product-detail-options-of-product-update/mp-product-detail-options-of-product-update.component'
              ).then(
                (mod) => mod.MpProductDetailOptionsOfProductUpdateComponent,
              ),
            title: (route) =>
              `Update Product Detail Options - ${(route.parent?.data['mpProductDetailOptionsOfProductUpdateResolvedData'] as MpProductDetailOptionsOfProductUpdateResolvedData).product.fullName}`,
          },
        ],
      },
      {
        path: ':productId/product-variant-options/update',
        resolve: {
          mpProductVariantOptionsOfProductUpdateResolvedData:
            mpProductVariantOptionsOfProductUpdateResolver,
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-products/mp-product-detail/update-product-options/mp-product-variant-options-of-product-update/mp-product-variant-options-of-product-update.component'
              ).then(
                (mod) => mod.MpProductVariantOptionsOfProductUpdateComponent,
              ),
            title: (route) =>
              `Update Product Variant Options - ${(route.parent?.data['mpProductVariantOptionsOfProductUpdateResolvedData'] as MpProductVariantOptionsOfProductUpdateResolvedData).product.fullName} - Product Detail`,
          },
        ],
      },
      {
        path: ':productId/product-variants/create',
        resolve: { product: mpProductVariantCreateResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-products/mp-product-detail/mp-product-variant-create/mp-product-variant-create.component'
              ).then((mod) => mod.MpProductVariantCreateComponent),
            title: (route) =>
              `Create Product Variant for ${route.parent?.data['product'].fullName} Product`,
          },
        ],
      },
      {
        path: ':productId/product-variants/:productVariantId/update',
        resolve: { productVariant: mpProductVariantUpdateResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-products/mp-product-detail/mp-product-variant-update/mp-product-variant-update.component'
              ).then((mod) => mod.MpProductVariantUpdateComponent),
            title: (route) => {
              const data = route.parent?.data[
                'productVariant'
              ] as ProductVariantMp;
              return `Update ${data.productName} ${data.variantLabel}`;
            },
          },
        ],
      },
      {
        path: ':productId/product-variants/:productVariantId/photos/update',
        resolve: {
          mpProductVariantPhotosUpdateResolvedData:
            mpProductVariantPhotosUpdateResolver,
        },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-products/mp-product-detail/mp-product-variant-photos-update/mp-product-variant-photos-update.component'
              ).then((mod) => mod.MpProductVariantPhotosUpdateComponent),
            title: (route) => {
              const data = route.parent?.data[
                'mpProductVariantPhotosUpdateResolvedData'
              ] as MpProductVariantPhotosUpdateResolvedData;
              return `Update Photos of ${data.productVariant.productName} ${data.productVariant.variantLabel}`;
            },
          },
        ],
      },
    ],
  },
  {
    path: 'product-options',
    data: { routeLabel: 'Product Options' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./mp-product-options/mp-product-options.component').then(
            (mod) => mod.MpProductOptionsComponent,
          ),
        title: 'Product Options',
        resolve: { productOptions: mpProductOptionsResolver },
      },
      {
        path: InvalidFiltersParametersData.urlPath,
        loadComponent: () =>
          import(
            '../../shared/components/invalid-filters-parameters/invalid-filters-parameters.component'
          ).then((mod) => mod.InvalidFiltersParametersComponent),
        title: 'Invalid Filters Parameters Product Options',
        data: {
          invalidFiltersParametersData: new InvalidFiltersParametersData(
            'Return to Product Options',
            '/management-panel/product-options',
            'styles',
          ),
        },
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './mp-product-options/mp-product-option-create/mp-product-option-create.component'
          ).then((mod) => mod.MpProductOptionCreateComponent),
        title: 'Product Options',
        resolve: [mpProductOptionCreateResolver],
      },

      {
        path: ':productOptionId',
        resolve: { productOption: mpProductOptionDetailResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-product-options/mp-product-option-detail/mp-product-option-detail.component'
              ).then((mod) => mod.MpProductOptionDetailComponent),
            title: (route) =>
              `${route.parent?.data['productOption'].name} - Product Option`,
          },
        ],
      },
    ],
  },
  {
    path: 'categories',
    data: { routeLabel: 'Categories' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./mp-main-categories/mp-main-categories.component').then(
            (mod) => mod.MpMainCategoriesComponent,
          ),
        title: 'Categories',
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './mp-main-categories/mp-main-category-create/mp-main-category-create.component'
          ).then((mod) => mod.MpMainCategoryCreateComponent),
        title: 'Create Category',
      },
      {
        path: ':mainCategoryId',
        loadComponent: () =>
          import(
            './mp-main-categories/mp-main-category-hierarchy-tree/mp-main-category-hierarchy-tree.component'
          ).then((mod) => mod.MpMainCategoryHierarchyTreeComponent),
        providers: [CategoryHelperMpService],
        resolve: { categoryData: mpCategoryHierarchyTreeResolver },
        children: [
          { path: '', redirectTo: 'details', pathMatch: 'prefix' },
          {
            path: 'details',
            children: [
              {
                path: '',
                resolve: { category: mpMainCategoryDetailResolver },
                children: [
                  {
                    path: '',
                    loadComponent: () =>
                      import(
                        './mp-main-categories/mp-main-category-hierarchy-tree/mp-category-detail/mp-category-detail.component'
                      ).then((mod) => mod.MpCategoryDetailComponent),
                    title: (route) =>
                      `${route.parent?.data['category'].name} Category`,
                  },
                ],
              },
              {
                path: 'update',
                resolve: { category: mpMainCategoryDetailResolver },
                children: [
                  {
                    path: '',
                    loadComponent: () =>
                      import(
                        './mp-main-categories/mp-main-category-hierarchy-tree/mp-category-detail/mp-category-update/mp-category-update.component'
                      ).then((mod) => mod.MpCategoryUpdateComponent),
                    title: (route) =>
                      `Update ${route.parent?.data['category'].name} Category`,
                  },
                ],
              },
            ],
          },
          {
            path: 'create',
            resolve: { category: mpMainCategoryDetailResolver },
            children: [
              {
                path: '',
                loadComponent: () =>
                  import(
                    './mp-main-categories/mp-main-category-hierarchy-tree/mp-subcategory-create/mp-subcategory-create.component'
                  ).then((mod) => mod.MpSubcategoryCreateComponent),
                title: (route) =>
                  `Create Subcategory for ${route.parent?.data['category'].name}`,
              },
            ],
          },
          {
            path: 'subcategories/:subcategoryId',
            children: [
              { path: '', redirectTo: 'details', pathMatch: 'prefix' },
              {
                path: 'details',
                children: [
                  {
                    path: '',
                    resolve: { category: mpSubcategoryDetailResolver },
                    children: [
                      {
                        path: '',
                        loadComponent: () =>
                          import(
                            './mp-main-categories/mp-main-category-hierarchy-tree/mp-category-detail/mp-category-detail.component'
                          ).then((mod) => mod.MpCategoryDetailComponent),
                        title: (route) =>
                          `${route.parent?.data['category'].name} Subcategory`,
                      },
                    ],
                  },
                  {
                    path: 'update',
                    resolve: { category: mpSubcategoryDetailResolver },
                    children: [
                      {
                        path: '',
                        loadComponent: () =>
                          import(
                            './mp-main-categories/mp-main-category-hierarchy-tree/mp-category-detail/mp-category-update/mp-category-update.component'
                          ).then((mod) => mod.MpCategoryUpdateComponent),
                        title: (route) =>
                          `Update ${route.parent?.data['category'].name} Subcategory`,
                      },
                    ],
                  },
                ],
              },
              {
                path: 'create',
                resolve: { category: mpSubcategoryDetailResolver },
                children: [
                  {
                    path: '',
                    loadComponent: () =>
                      import(
                        './mp-main-categories/mp-main-category-hierarchy-tree/mp-subcategory-create/mp-subcategory-create.component'
                      ).then((mod) => mod.MpSubcategoryCreateComponent),
                    title: (route) =>
                      `Create Subcategory for ${route.parent?.data['category'].name}`,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'orders',
    data: { routeLabel: 'Orders' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./mp-orders/mp-orders.component').then(
            (mod) => mod.MpOrdersComponent,
          ),
        title: 'Orders',
        resolve: { mpPagedOrdersResolvedData: mpPagedOrdersResolver },
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
            '/management-panel/orders',
            'shopping_bag',
          ),
        },
      },
      {
        path: ':orderId',
        resolve: { orderDetail: mpOrderDetailResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-orders/mp-order-detail/mp-order-detail.component'
              ).then((mod) => mod.MpOrderDetailComponent),
            title: (route) =>
              `Order ${(route.parent?.data['orderDetail'] as OrderDetailMp).id}`,
          },
        ],
      },
      {
        path: ':orderId/update',
        resolve: { order: mpOrderUpdateResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-orders/mp-order-detail/mp-order-update/mp-order-update.component'
              ).then((mod) => mod.MpOrderUpdateComponent),
            title: (route) =>
              `Update Order ${(route.parent?.data['order'] as OrderMp).id}`,
          },
        ],
      },
    ],
  },
  {
    path: 'main-page-sections',
    data: { routeLabel: 'Main Page Sections' },
    providers: [WebsiteHeroSectionItemMpService],
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './mp-main-page-sections/mp-main-page-sections.component'
          ).then((mod) => mod.MpMainPageSectionsComponent),
        title: 'Main Page Sections',
      },
      {
        path: ':mainPageSectionId/details',
        resolve: { mainPageSection: mpMainPageSectionDetailResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-main-page-sections/mp-main-page-section-detail/mp-main-page-section-detail.component'
              ).then((mod) => mod.MpMainPageSectionDetailComponent),
            title: mpManPageSectionDetailTitleResolver,
          },
        ],
      },
      {
        path: ':mainPageSectionId/update',
        resolve: { websiteHeroSection: mpWebsiteHeroSectionUpdateResolver },
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-main-page-sections/mp-main-page-section-detail/mp-website-hero-section-detail/mp-website-hero-section-update/mp-website-hero-section-update.component'
              ).then((mod) => mod.MpWebsiteHeroSectionUpdateComponent),
            title: (route) => {
              const data = route.parent?.data[
                'websiteHeroSection'
              ] as WebsiteHeroSectionMp;
              return `Update ${data.label} - ${data.mainPageSectionType}`;
            },
          },
        ],
      },
      {
        path: ':mainPageSectionId/items/create',
        resolve: { websiteHeroSection: mpWebsiteHeroSectionItemCreateResolver },

        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-main-page-sections/mp-main-page-section-detail/mp-website-hero-section-detail/mp-website-hero-section-item-create/mp-website-hero-section-item-create.component'
              ).then((mod) => mod.MpWebsiteHeroSectionItemCreateComponent),
            title: (route) => {
              const data = route.parent?.data[
                'websiteHeroSection'
              ] as WebsiteHeroSectionMp;
              return `Create Item For ${data.label} - ${data.mainPageSectionType}`;
            },
          },
        ],
      },
      {
        path: ':mainPageSectionId/items/:websiteHeroSectionItemId/update',
        resolve: {
          mpWebsiteHeroSectionItemUpdateResolvedData:
            mpWebsiteHeroSectionItemUpdateResolver,
        },

        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './mp-main-page-sections/mp-main-page-section-detail/mp-website-hero-section-detail/mp-website-hero-section-item-update/mp-website-hero-section-item-update.component'
              ).then((mod) => mod.MpWebsiteHeroSectionItemUpdateComponent),
            title: (route) => {
              const data = route.parent?.data[
                'mpWebsiteHeroSectionItemUpdateResolvedData'
              ] as MpWebsiteHeroSectionItemUpdateResolvedData;
              return `Update Item ${data.websiteHeroSectionItem.id} For ${data.websiteHeroSection.label} - ${data.websiteHeroSection.mainPageSectionType}`;
            },
          },
        ],
      },
      {
        path: 'create',
        loadComponent: () =>
          import(
            './mp-main-page-sections/mp-main-page-section-create/mp-main-page-section-create.component'
          ).then((mod) => mod.MpMainPageSectionCreateComponent),
        title: 'Create Main Page Section',
        resolve: { mpMainPageSectionCreateResolver },
      },
    ],
  },
];
