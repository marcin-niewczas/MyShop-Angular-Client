import { Component, input, output } from '@angular/core';
import { WebsiteProductsCarouselSectionMp } from '../../../models/main-page-sections/main-page-section-mp.interface';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-mp-website-products-carousel-detail',
  standalone: true,
  imports: [
    MatDividerModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
  ],
  templateUrl: './mp-website-products-carousel-detail.component.html',
  styleUrl: './mp-website-products-carousel-detail.component.scss',
})
export class MpWebsiteProductsCarouselDetailComponent {
  readonly data = input.required<WebsiteProductsCarouselSectionMp>();
  readonly remove = output<string>();

  readonly isRemoveProcess = input.required<boolean>();
}
