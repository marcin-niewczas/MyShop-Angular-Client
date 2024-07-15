import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  input,
} from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar, faStarHalfStroke } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import {
  MatColor,
  getMatColorClass,
} from '../../../../themes/global-theme.service';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [NgStyle, NgClass, RouterModule, FontAwesomeModule],
  templateUrl: './star-rating.component.html',
})
export class StarRatingComponent implements OnInit, OnChanges {
  readonly maxRate = this._apiService.apiConfiguration.productReviewMaxRate;
  readonly iconColor = input<MatColor | 'disabled'>('primary');
  readonly currentRate = input.required<number>();
  readonly reviewCount = input<number>();
  readonly showCurrentRate = input(false);
  readonly size = input(1.6);

  readonly emptyStarIcon = faStar;
  readonly fillStarIcon = fasStar;
  readonly halfStarIcon = faStarHalfStroke;
  fillStars!: number[];
  emptyStars!: number[];
  halfStars!: number[];

  constructor(private readonly _apiService: ApiService) {
    if (this.maxRate === undefined) {
      throw Error('productReviewMaxRate cannot be undefined.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const rate = changes['currentRate']?.currentValue;

    if (rate !== undefined) {
      if (!Number.isInteger(rate)) {
        const roundedCurrentValue = Math.round(rate);
        if (roundedCurrentValue > rate) {
          this.halfStars = Array(1);
          this.fillStars = Array(
            roundedCurrentValue - 1 <= 0 ? 0 : roundedCurrentValue - 1,
          );
        } else {
          this.fillStars = Array(roundedCurrentValue);
          this.halfStars = Array(0);
        }
      } else {
        this.fillStars = Array(rate);
        this.halfStars = Array(0);
      }

      this.emptyStars = Array(
        this.maxRate - (this.halfStars.length + this.fillStars.length),
      );
    }
  }

  ngOnInit(): void {
    if (!Number.isInteger(this.maxRate)) {
      throw Error('maxRate must be natural number');
    }

    if (this.maxRate < this.currentRate()) {
      throw Error('currentRate cannot be greater than maxRate');
    }

    if (this.reviewCount() && this.reviewCount()! < 0) {
      throw Error('reviewCount cannot be less than 0');
    }

    if (!Number.isInteger(this.currentRate())) {
      const roundedCurrentValue = Math.round(this.currentRate());
      if (roundedCurrentValue > this.currentRate()) {
        this.halfStars = Array(1);
        this.fillStars = Array(
          roundedCurrentValue - 1 <= 0 ? 0 : roundedCurrentValue - 1,
        );
      } else {
        this.fillStars = Array(roundedCurrentValue);
        this.halfStars = Array(0);
      }
    } else {
      this.fillStars = Array(this.currentRate());
      this.halfStars = Array(0);
    }

    this.emptyStars = Array(
      this.maxRate - (this.halfStars.length + this.fillStars.length),
    );
  }

  getColorClass() {
    const iconColor = this.iconColor();

    if (iconColor === 'disabled') {
      return 'custom-disabled-color';
    }

    return getMatColorClass(iconColor);
  }
}
