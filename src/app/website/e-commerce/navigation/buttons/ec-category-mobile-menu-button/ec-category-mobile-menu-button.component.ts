import { Component, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ec-category-mobile-menu-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `<button
    (click)="categoryMenuOpened.set(!categoryMenuOpened())"
    mat-icon-button
  >
    <mat-icon>menu</mat-icon>
  </button>`,
})
export class EcCategoryMobileMenuButtonComponent {
  readonly categoryMenuOpened = model.required<boolean>();
}
