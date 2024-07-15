import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';

export interface CategoryMp extends BaseIdTimestampResponse {
  readonly name: string;
  readonly hierarchyName: string;
  readonly childCategories?: CategoryMp[];
  readonly parentCategoryId?: string;
  readonly rootCategoryId?: string;
  readonly level: number;
}
