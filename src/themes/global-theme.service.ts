import { Injectable, signal } from '@angular/core';

type Theme = 'light-theme' | 'dark-theme';

export type MatColor = 'primary' | 'accent' | 'warn';

export function getMatColorClass(color: MatColor) {
  switch (color) {
    case 'primary':
      return 'primary-color';
    case 'accent':
      return 'accent-color';
    case 'warn':
      return 'warn-color';
  }
}

@Injectable({
  providedIn: 'root',
})
export class GlobalThemeService {
  private readonly _theme = signal<Theme | undefined>(undefined);
  readonly theme = this._theme.asReadonly();

  setTheme(theme: Theme) {
    if (theme === 'light-theme') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }

    this.setThemeInLocalStorage(theme);
    this._theme.set(theme);
  }

  setCurrentTheme() {
    if (!this._theme()) {
      const currentTheme = this.getThemeFromLocalStorage();

      if (currentTheme) {
        this.setTheme(currentTheme);
      } else {
        this.setTheme('light-theme');
      }
    }
  }

  private setThemeInLocalStorage(theme: Theme) {
    localStorage.setItem('theme', theme);
  }

  private getThemeFromLocalStorage() {
    return localStorage.getItem('theme') as Theme | undefined;
  }
}
