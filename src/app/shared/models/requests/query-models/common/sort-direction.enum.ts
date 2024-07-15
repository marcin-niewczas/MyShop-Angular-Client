export enum SortDirection {
  Asc = 'Ascendant',
  Desc = 'Descendant',
}

export function mapToMatSortDirection(sortDirection?: SortDirection) {
  switch (sortDirection) {
    case SortDirection.Asc:
      return 'asc';
    case SortDirection.Desc:
      return 'desc';
    default:
      return '';
  }
}
