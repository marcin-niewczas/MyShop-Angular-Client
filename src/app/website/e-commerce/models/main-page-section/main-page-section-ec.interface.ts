import { nameof } from '../../../../shared/functions/helper-functions';
import { MainPageSectionType } from '../../../../shared/models/main-page-section/main-page-section-type.enum';
import { WebsiteHeroSectionDisplayType } from '../../../../shared/models/main-page-section/website-hero-section-display-type.enum';
import { PhotoItem } from '../../../../shared/models/photo/photo-item.interface';
import { ProductListItem } from '../../../../shared/models/product/product-list-item.interface';

export interface MainPageSectionEc {
  readonly mainPageSectionType: MainPageSectionType;
}

export interface WebsiteHeroSectionEc extends MainPageSectionEc {
  readonly items: readonly WebsiteHeroSectionItemEc[];
  readonly displayType: WebsiteHeroSectionDisplayType;
}

interface WebsiteHeroSectionItemEc {
  readonly title?: string;
  readonly subtitle?: string;
  readonly routerLink?: string;
  readonly photo: PhotoItem;
}

export interface WebsiteProductsCarouselSectionEc extends MainPageSectionEc {
  readonly productsCarouselSectionType: string;
  readonly items: readonly ProductListItem[];
}

export function isWebsiteHeroSectionEc(
  value: any,
): value is WebsiteHeroSectionEc {
  return (
    nameof<MainPageSectionEc>('mainPageSectionType') in value &&
    value.mainPageSectionType === MainPageSectionType.WebsiteHeroSection
  );
}

export function isWebsiteProductCarouselSectionEc(
  value: any,
): value is WebsiteProductsCarouselSectionEc {
  return (
    nameof<MainPageSectionEc>('mainPageSectionType') in value &&
    value.mainPageSectionType ===
      MainPageSectionType.WebsiteProductsCarouselSection
  );
}
