import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { GlobalThemeService } from '../global-theme.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-theme-icon-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `<button color="primary" mat-icon-button (click)="toggleTheme()">
    @if (themeService.theme() === 'light-theme') {
      <mat-icon>dark_mode</mat-icon>
    } @else {
      <mat-icon>light_mode</mat-icon>
    }
  </button>`,
})
export class ThemeIconButtonComponent {
  readonly themeService = inject(GlobalThemeService);

  toggleTheme() {
    this.themeService.theme() === 'light-theme'
      ? this.themeService.setTheme('dark-theme')
      : this.themeService.setTheme('light-theme');
  }
}
