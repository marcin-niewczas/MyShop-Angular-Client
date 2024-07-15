import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';
import { PhotoMp } from '../photos/photo-mp.interface';

export interface WebsiteHeroSectionItemMp extends BaseIdTimestampResponse {
  readonly title?: string;
  readonly subtitle?: string;
  readonly routerLink?: string;
  readonly position?: number;
  readonly photo: PhotoMp;
  readonly websiteHeroSectionId: string;
}
