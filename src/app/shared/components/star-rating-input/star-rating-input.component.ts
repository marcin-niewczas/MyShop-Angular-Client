import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as fasStar } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../services/api.service';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatColor } from '../../../../themes/global-theme.service';

@Component({
  selector: 'app-star-rating-input',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, NgClass],
  templateUrl: './star-rating-input.component.html',
  styleUrl: './star-rating-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: StarRatingInputComponent,
    },
  ],
})
export class StarRatingInputComponent implements ControlValueAccessor {
  readonly color = input<MatColor>('primary');
  readonly size = input('18px');
  readonly formControl = input<FormControl<number | null>>();

  disabled = false;

  backupIndex = this.formControl()?.value ?? 0;
  isPreview = false;

  stars: boolean[] = Array(
    this._apiService.apiConfiguration.productReviewMaxRate,
  ).fill(false);

  private _touched = false;
  private onChange(value: number) {}
  private onTouched() {}

  readonly emptyStarIcon = faStar;
  readonly fillStarIcon = fasStar;

  constructor(private readonly _apiService: ApiService) {
    if (_apiService.apiConfiguration.productReviewMaxRate === undefined) {
      throw Error('productReviewMaxRate cannot be undefined.');
    }
  }

  writeValue(value: number): void {
    this.stars = this.stars.map((_, index) => value > index);
    this.backupIndex = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onStarSelected(rate: number) {
    if (this.disabled) return;

    this.markAsTouched();
    this.stars = this.stars.map((_, index) => rate > index);
    this.backupIndex = rate;
    this.onChange(rate);
  }

  onStarMouseEnter(rate: number) {
    if (this.disabled) return;
    if (this.stars.filter((x) => x === true).length !== rate) {
      {
        this.stars = this.stars.map((_, index) => rate > index);
      }
    }
  }

  onStarMouseLeave() {
    if (this.disabled) return;
    this.stars = this.stars.map((_, index) => index < this.backupIndex);
  }

  getColor() {
    if (this.disabled) {
      return 'custom-disabled-color';
    }

    if (this.formControl()?.touched && !this.formControl()?.valid) {
      return 'warn-color';
    }

    switch (this.color()) {
      case 'primary':
        return 'primary-color';
      case 'accent':
        return 'accent-color';
      case 'warn':
        return 'warn-color';
      default:
        return '';
    }
  }

  private markAsTouched() {
    if (!this._touched) {
      this.onTouched();
      this._touched = true;
    }
  }
}
