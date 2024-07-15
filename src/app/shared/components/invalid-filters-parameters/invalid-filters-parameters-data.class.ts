export class InvalidFiltersParametersData {
  static readonly urlPath = 'invalid-filters-parameters';

  constructor(
    readonly buttonLabel: string,
    readonly routerLink: string | string[],
    readonly iconName?: string
  ) {}
}
