import { Component, inject } from '@angular/core';
import { GlobalThemeService } from '../global-theme.service';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-theme-list-item-button',
  standalone: true,
  imports: [MatIconModule, MatRippleModule],
  template: `<button
    matRipple
    class="custom-button nav-not-active-item-color action-background-color-hover"
    (click)="toggleTheme()"
  >
    @if (themeService.theme() === 'light-theme') {
      <mat-icon>dark_mode</mat-icon>Dark Mode
    } @else {
      <mat-icon>light_mode</mat-icon>Light Mode
    }
  </button>`,
  styles: `
    button {
      padding: 0 1.6rem;
      display: flex;
      align-items: center;
      height: 48px;
      user-select: none;
      width: 100%;
      font-size: 1.6rem;

      mat-icon {
        margin-right: 1.6rem;
      }
    }
  `,
})
export class ThemeListItemButtonComponent {
  readonly themeService = inject(GlobalThemeService);

  toggleTheme() {
    this.themeService.theme() === 'light-theme'
      ? this.themeService.setTheme('dark-theme')
      : this.themeService.setTheme('light-theme');
  }
}
