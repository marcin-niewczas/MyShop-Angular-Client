import { Component, input, model } from '@angular/core';
import { rotateIconAnimation } from '../animations';
import { SortDirection } from '../../models/requests/query-models/common/sort-direction.enum';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sort-direction-icon-button',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `<button
    mat-icon-button
    (click)="swapDirection()"
    [disabled]="disabled()"
  >
    <mat-icon
      [@rotateIcon]="value() !== SortDirection.Desc ? 'true' : 'false'"
      >{{ 'arrow_downward' }}</mat-icon
    >
  </button>`,
  animations: [rotateIconAnimation],
})
export class SortDirectionIconButtonComponent {
  readonly disabled = input(false);
  readonly value = model.required<SortDirection | undefined>();
  readonly SortDirection = SortDirection;

  swapDirection() {
    if (this.value() == SortDirection.Asc || !this.value()) {
      this.value.set(SortDirection.Desc);
    } else {
      this.value.set(SortDirection.Asc);
    }
  }
}
