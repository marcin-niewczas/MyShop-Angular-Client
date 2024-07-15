import { Component, EventEmitter, Output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-account-navigation-list',
  standalone: true,
  imports: [RouterLink, MatIconModule, RouterLinkActive, MatRippleModule],
  templateUrl: './account-navigation-list.component.html',
  styleUrl: './account-navigation-list.component.scss',
})
export class AccountNavigationListComponent {
  @Output() readonly clickedNavItem = new EventEmitter<void>();

  readonly navItems = [
    {
      label: 'Account',
      routerLink: './info',
      icon: 'manage_accounts',
    },
    {
      label: 'Addresses',
      routerLink: './addresses',
      icon: 'location_on',
    },
    {
      label: 'Orders',
      routerLink: './orders',
      icon: 'shopping_bag',
    },
    {
      label: 'Favorites',
      routerLink: './favorites',
      icon: 'favorite',
    },
    {
      label: 'Notifications',
      routerLink: './notifications',
      icon: 'notifications',
    },
    {
      label: 'Security',
      routerLink: './security',
      icon: 'lock',
    },
  ] as {
    label: string;
    routerLink: string;
    icon: string;
  }[];
}
