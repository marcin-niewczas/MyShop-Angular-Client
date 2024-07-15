import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { PhotoComponent } from '../../../../../../shared/components/photo/photo.component';
import { BreakpointObserverService } from '../../../../../../shared/services/breakpoint-observer.service';
import { WebsiteHeroSectionEc } from '../../../../models/main-page-section/main-page-section-ec.interface';

@Component({
  selector: 'app-ec-website-hero-section-grid-item',
  standalone: true,
  imports: [PhotoComponent, RouterLink, NgClass, MatButtonModule],
  templateUrl: './ec-website-hero-section-grid-item.component.html',
  styleUrl: './ec-website-hero-section-grid-item.component.scss',
})
export class EcWebsiteHeroSectionGridItemComponent {
  readonly breakpointObserverService = inject(BreakpointObserverService);
  readonly data = input.required<WebsiteHeroSectionEc>();

  isSpan() {
    const length = this.data().items.length;

    if (length === 1) {
      return true;
    }

    if (length % 3 === 0 && this.breakpointObserverService.isLargeScreen()) {
      return false;
    }

    if (length % 2 === 1) {
      return true;
    }

    return false;
  }
}
