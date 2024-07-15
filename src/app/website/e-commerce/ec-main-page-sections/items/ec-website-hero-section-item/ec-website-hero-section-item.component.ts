import { Component, input } from '@angular/core';
import { WebsiteHeroSectionEc } from '../../../models/main-page-section/main-page-section-ec.interface';
import { EcWebsiteHeroSectionCarouselItemComponent } from './ec-website-hero-section-carousel-item/ec-website-hero-section-carousel-item.component';
import { EcWebsiteHeroSectionGridItemComponent } from './ec-website-hero-section-grid-item/ec-website-hero-section-grid-item.component';
import { WebsiteHeroSectionDisplayType } from '../../../../../shared/models/main-page-section/website-hero-section-display-type.enum';

@Component({
  selector: 'app-ec-website-hero-section-item',
  standalone: true,
  imports: [
    EcWebsiteHeroSectionCarouselItemComponent,
    EcWebsiteHeroSectionGridItemComponent,
  ],
  templateUrl: './ec-website-hero-section-item.component.html',
})
export class EcWebsiteHeroSectionItemComponent {
  readonly data = input.required<WebsiteHeroSectionEc>();

  readonly WebsiteHeroSectionDisplayType = WebsiteHeroSectionDisplayType;
}
