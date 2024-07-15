import { nameof } from '../../../../shared/functions/helper-functions';
import { MainPageSectionType } from '../../../../shared/models/main-page-section/main-page-section-type.enum';
import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';

export interface MainPageSectionMp extends BaseIdTimestampResponse {
  readonly mainPageSectionType: MainPageSectionType;
  readonly position: number;
}

export interface WebsiteHeroSectionMp extends MainPageSectionMp {
  readonly label: string;
  readonly displayType: string;
}

export interface WebsiteProductsCarouselSectionMp extends MainPageSectionMp {
  readonly productsCarouselSectionType: string;
}

export function isWebsiteHeroSectionMp(
  value: any,
): value is WebsiteHeroSectionMp {
  return (
    nameof<MainPageSectionMp>('mainPageSectionType') in value &&
    value.mainPageSectionType === MainPageSectionType.WebsiteHeroSection
  );
}

export function isWebsiteProductCarouselSectionMp(
  value: any,
): value is WebsiteProductsCarouselSectionMp {
  return (
    nameof<MainPageSectionMp>('mainPageSectionType') in value &&
    value.mainPageSectionType ===
      MainPageSectionType.WebsiteProductsCarouselSection
  );
}
