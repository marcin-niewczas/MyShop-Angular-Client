import { Component } from '@angular/core';
import { AccountNavigationListComponent } from '../account-navigation-list/account-navigation-list.component';

@Component({
  selector: 'app-account-desktop-navigation',
  standalone: true,
  imports: [AccountNavigationListComponent],
  template: '<app-account-navigation-list></app-account-navigation-list>',
})
export class AccountDesktopNavigationComponent {}
