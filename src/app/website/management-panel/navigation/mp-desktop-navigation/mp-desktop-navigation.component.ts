import {
  trigger,
  state,
  style,
  transition,
  group,
  animate,
  query,
  animateChild,
} from '@angular/animations';
import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChartLine } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../authenticate/auth.service';
import { mpNavigationItems } from '../mp-navigation-items';

@Component({
  selector: 'app-mp-desktop-navigation',
  standalone: true,
  imports: [
    FontAwesomeModule,
    MatIconModule,
    MatDividerModule,
    RouterLink,
    RouterLinkActive,
    NgClass,
    MatRippleModule,
  ],
  templateUrl: './mp-desktop-navigation.component.html',
  styleUrl: './mp-desktop-navigation.component.scss',
  animations: [
    trigger('expandCollapseWidth', [
      state('expanded', style({ width: '*' })),
      state('collapsed', style({ width: '44px' })),
      transition(
        'expanded <=> collapsed',
        group([animate('.4s ease-in-out'), query('@*', animateChild())]),
      ),
    ]),
    trigger('subheaderLabelTrigger', [
      state('expanded', style({ width: '*', opacity: 1 })),
      state('collapsed', style({ width: '0', opacity: 0 })),
      transition('expanded <=> collapsed', animate('.4s ease-in-out')),
    ]),
  ],
})
export class MpDesktopNavigationComponent {
  private readonly _authService = inject(AuthService);

  readonly faChartLine = faChartLine;
  readonly navigationItems = mpNavigationItems;

  readonly opened = input.required<boolean>();

  readonly hasEmployeeManagerPermission =
    this._authService.hasEmployeeManagerPermission;
}
