import { Component, model } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ec-category-desktop-menu-button',
  standalone: true,
  imports: [MatIconModule, MatRippleModule],
  template: `<button
    class="custom-button action-background-color-hover"
    (click)="categoryMenuOpened.set(!categoryMenuOpened())"
    matRipple
  >
    <mat-icon>menu</mat-icon><span>Menu</span>
  </button>`,
  styleUrl: './ec-category-desktop-menu-button.component.scss',
})
export class EcCategoryDesktopMenuButtonComponent {
  readonly categoryMenuOpened = model.required<boolean>();
}
