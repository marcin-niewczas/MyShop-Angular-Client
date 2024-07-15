export interface CategoryEc {
  readonly id: string;
  readonly name: string;
  readonly isRoot: boolean;
  readonly hierarchyName: string;
  readonly encodedHierarchyName: string;
  readonly childCategories?: CategoryEc[];
}
