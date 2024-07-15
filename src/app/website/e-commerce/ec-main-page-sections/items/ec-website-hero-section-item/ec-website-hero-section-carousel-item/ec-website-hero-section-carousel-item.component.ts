import { CUSTOM_ELEMENTS_SCHEMA, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { PhotoComponent } from '../../../../../../shared/components/photo/photo.component';
import { WebsiteHeroSectionEc } from '../../../../models/main-page-section/main-page-section-ec.interface';

@Component({
  selector: 'app-ec-website-hero-section-carousel-item',
  standalone: true,
  imports: [PhotoComponent, RouterLink, MatButtonModule],
  templateUrl: './ec-website-hero-section-carousel-item.component.html',
  styleUrl: './ec-website-hero-section-carousel-item.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EcWebsiteHeroSectionCarouselItemComponent {
  readonly data = input.required<WebsiteHeroSectionEc>();
}
