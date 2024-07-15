export type BreadcrumbsItems = BreadcrumbsItem[];

interface BreadcrumbsItem {
  label: string;
  routerLink?: string | string[];
}
