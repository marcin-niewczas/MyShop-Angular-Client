import { Component, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ec-search-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `<button
    color="primary"
    mat-icon-button
    (click)="searchOpened.set(!searchOpened())"
  >
    <mat-icon>search</mat-icon>
  </button> `,
})
export class EcSearchButtonComponent {
  readonly searchOpened = model.required<boolean>();
}
