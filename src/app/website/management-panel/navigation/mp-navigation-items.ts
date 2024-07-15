export const mpNavigationItems: {
  labelName: string;
  iconName?: string;
  path?: string;
  isSubheader: boolean;
  requireManagerSubrole?: boolean;
}[] = [
  {
    labelName: 'Statistics',
    iconName: undefined,
    isSubheader: true,
    path: undefined,
  },
  {
    labelName: 'Dashboard',
    iconName: 'dashboard',
    isSubheader: false,
    path: 'dashboard',
  },
  {
    labelName: 'Manage Website',
    iconName: undefined,
    isSubheader: true,
    path: undefined,
    requireManagerSubrole: true,
  },
  {
    labelName: 'Main Page Sections',
    iconName: 'web',
    isSubheader: false,
    path: 'main-page-sections',
    requireManagerSubrole: true,
  },
  {
    labelName: 'Manage products',
    iconName: undefined,
    isSubheader: true,
    path: undefined,
  },
  {
    labelName: 'Categories',
    iconName: 'category',
    isSubheader: false,
    path: 'categories',
  },
  {
    labelName: 'Products',
    iconName: 'checkroom',
    isSubheader: false,
    path: 'products',
  },
  {
    labelName: 'Product Options',
    iconName: 'style',
    isSubheader: false,
    path: 'product-options',
  },
  {
    labelName: 'Orders',
    iconName: undefined,
    isSubheader: true,
    path: undefined,
  },
  {
    labelName: 'Orders',
    iconName: 'shopping_bag',
    isSubheader: false,
    path: 'orders',
  },
];
