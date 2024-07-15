import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AccountMobileNavigationSidebarComponent } from './account-mobile-navigation-sidebar.component';

@Component({
  selector: 'app-account-mobile-navigation-button',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    AccountMobileNavigationSidebarComponent,
  ],
  template: `<app-account-mobile-navigation-sidebar
      [(opened)]="opened"
    ></app-account-mobile-navigation-sidebar>
    <button mat-icon-button (click)="opened.set(true)">
      <mat-icon>menu</mat-icon>
    </button>`,
})
export class AccountMobileNavigationButtonComponent {
  readonly opened = signal(false);
}
