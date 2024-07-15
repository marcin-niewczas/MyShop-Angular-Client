import { DecimalPipe, NgClass, NgStyle } from '@angular/common';
import { Component, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import {
  MatColor,
  getMatColorClass,
} from '../../../../themes/global-theme.service';

@Component({
  selector: 'app-small-star-rating',
  standalone: true,
  imports: [FaIconComponent, NgClass, NgStyle, DecimalPipe],
  templateUrl: './small-star-rating.component.html',
  styleUrl: './small-star-rating.component.scss',
})
export class SmallStarRatingComponent {
  readonly iconColor = input<MatColor | 'disabled'>('primary');
  readonly currentRate = input.required<number>();
  readonly reviewCount = input<number>();
  readonly size = input(1.6);

  readonly fillStarIcon = faStar;

  getColorClass() {
    const iconColor = this.iconColor();

    if (iconColor === 'disabled') {
      return 'custom-disabled-color';
    }

    return getMatColorClass(iconColor);
  }
}
