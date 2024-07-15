import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { MpProductDetailResolvedData } from './mp-product-detail.resolver';
import { MpPagedProductVariantsListComponent } from './mp-paged-product-variants-list/mp-paged-product-variants-list.component';
import { MpProductReviewSidebarComponent } from './mp-product-review-sidebar/mp-product-review-sidebar.component';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { ReviewRatingStatsComponent } from '../../../../shared/components/review-rating-stats/review-rating-stats.component';
import { ProductReviewRateStats } from '../../../../shared/models/product/product-review-rate-stats.interface';
import { ApiPagedResponse } from '../../../../shared/models/responses/api-paged-response.interface';
import { PagedProductVariantMp } from '../../models/product-variant/paged-product-variant-mp.interface';

@Component({
  selector: 'app-mp-product-detail',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatDividerModule,
    DatePipe,
    MpPagedProductVariantsListComponent,
    ReviewRatingStatsComponent,
    MpProductReviewSidebarComponent,
  ],
  templateUrl: './mp-product-detail.component.html',
  styleUrl: './mp-product-detail.component.scss',
})
export class MpProductDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Products', routerLink: '../' },
  ];

  readonly pagedProductVariantsResponse = signal<
    ApiPagedResponse<PagedProductVariantMp>
  >(undefined!);

  readonly productReviewRateStats = signal<ProductReviewRateStats>(undefined!);

  readonly productReviewsSidebarOpened = signal(false);

  readonly isProductReviewRateStatsRefresh = signal(false);

  readonly product = toSignal(
    this._activatedRoute.data.pipe(
      map(({ mpProductDetailResolvedData }) => {
        const data = mpProductDetailResolvedData as MpProductDetailResolvedData;
        this.breadcrumbsItems.push({ label: data.product.fullName });

        this.pagedProductVariantsResponse.set(
          data.pagedProductVariantsResponse,
        );
        this.productReviewRateStats.set(data.productReviewRateStats);
        return data.product;
      }),
    ),
  );
}
