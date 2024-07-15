import {
  Component,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { ProductReviewRateStats } from '../../models/product/product-review-rate-stats.interface';
import { ApiService } from '../../services/api.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { DecimalPipe, NgClass } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';
import { inOutAnimation } from '../animations';
import { toBoolean } from '../../functions/transform-functions';

@Component({
  selector: 'app-review-rating-stats',
  standalone: true,
  imports: [
    StarRatingComponent,
    FontAwesomeModule,
    DecimalPipe,
    NgClass,
    LoadingComponent,
  ],
  templateUrl: './review-rating-stats.component.html',
  styleUrl: './review-rating-stats.component.scss',
  animations: [inOutAnimation],
})
export class ReviewRatingStatsComponent implements OnChanges {
  readonly productReviewMaxRate =
    inject(ApiService).apiConfiguration.productReviewMaxRate;

  readonly productReviewRateStats = input.required<
    ProductReviewRateStats | undefined
  >();
  readonly activeRate = model<number | undefined>();

  readonly isDataRefreshProcess = input(false);

  readonly isNoReviews = signal(true);

  readonly withFilters = input(true, { transform: toBoolean });

  readonly fillStarIcon = faStar;

  ngOnChanges(changes: SimpleChanges): void {
    const productReviewRateStatsChanges = changes['productReviewRateStats'];

    if (productReviewRateStatsChanges) {
      const productReviewRateStats =
        productReviewRateStatsChanges.currentValue as ProductReviewRateStats;

      if (productReviewRateStats) {
        this.isNoReviews.set(
          productReviewRateStats.rateCounts.filter((x) => x.count > 0).length <=
            1
        );
      } else {
        this.isNoReviews.set(true);
      }
    }
  }

  onChooseActiveRate(value: number, radio: HTMLInputElement) {
    if (!radio.disabled) {
      radio.checked = !radio.checked;
      if (radio.checked) {
        this.activeRate.set(value);
      } else {
        this.activeRate.set(undefined);
      }
    }
  }
}
