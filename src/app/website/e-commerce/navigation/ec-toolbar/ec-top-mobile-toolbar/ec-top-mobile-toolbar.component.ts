import { Component, inject, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EcCategoryMobileMenuButtonComponent } from '../../buttons/ec-category-mobile-menu-button/ec-category-mobile-menu-button.component';
import { EcSearchButtonComponent } from '../../buttons/ec-search-button/ec-search-button.component';
import {
  ECommerceRouteSection,
  ECommerceRouteService,
} from '../../../services/ecommerce-route.service';
import { ShowHideScrollToolbarDirective } from '../../../../../shared/directives/show-hide-scroll-toolbar.directive';
import { BreakpointObserverService } from '../../../../../shared/services/breakpoint-observer.service';

@Component({
  selector: 'app-ec-top-mobile-toolbar',
  standalone: true,
  imports: [
    EcCategoryMobileMenuButtonComponent,
    RouterLink,
    ShowHideScrollToolbarDirective,
    EcSearchButtonComponent,
  ],
  templateUrl: './ec-top-mobile-toolbar.component.html',
  styleUrl: '../ec-toolbar.component.scss',
})
export class EcTopMobileToolbarComponent {
  private readonly _breakpointObserverSerivce = inject(
    BreakpointObserverService,
  );
  private readonly _eCommerceRouteService = inject(ECommerceRouteService);

  readonly isSmallScreen = this._breakpointObserverSerivce.isSmallScreen;
  readonly categoryMenuOpened = model.required<boolean>();
  readonly searchOpened = model.required<boolean>();
  readonly showElevation = input<boolean>();

  readonly eCommerceRouteSection =
    this._eCommerceRouteService.currentRouteSection;

  readonly ECommerceRouteSection = ECommerceRouteSection;
}
