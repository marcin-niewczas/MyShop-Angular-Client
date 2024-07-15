import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { WebsiteProductsCarouselSectionEc } from '../../../models/main-page-section/main-page-section-ec.interface';

import { SwiperOptions } from 'swiper/types';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PhotoComponent } from '../../../../../shared/components/photo/photo.component';
import { SmallStarRatingComponent } from '../../../../../shared/components/small-star-rating/small-star-rating.component';

@Component({
  selector: 'app-ec-website-products-carousel-section-item',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    CurrencyPipe,
    PhotoComponent,
    SmallStarRatingComponent,
    MatIconModule,
  ],
  templateUrl: './ec-website-products-carousel-section-item.component.html',
  styleUrl: './ec-website-products-carousel-section-item.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EcWebsiteProductsCarouselSectionItemComponent
  implements AfterViewInit
{
  readonly swiper = viewChild.required<ElementRef<any>>('swiper');
  ngAfterViewInit(): void {
    const swiperEl = document.querySelector('swiper-container')!;
    Object.assign(this.swiper().nativeElement, {
      slidesPerView: 1,
      spaceBetween: 10,
      autoplay: {
        pauseOnMouseEnter: true,
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        clickable: true,
      },
      breakpoints: {
        600: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1000: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1300: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
        1920: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
      },
    } as SwiperOptions);
    this.swiper().nativeElement.initialize();
  }

  readonly data = input.required<WebsiteProductsCarouselSectionEc>();
}
