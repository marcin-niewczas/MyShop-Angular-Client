import { SortDirection } from './sort-direction.enum';

export interface SortQueryParams<TSortBy> {
  sortBy?: TSortBy;
  sortDirection?: SortDirection;
}
