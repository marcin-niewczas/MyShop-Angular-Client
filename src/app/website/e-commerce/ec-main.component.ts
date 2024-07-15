import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { inOutAnimation } from '../../shared/components/animations';
import { BreakpointObserverService } from '../../shared/services/breakpoint-observer.service';
import {
  ECommerceRouteSection,
  ECommerceRouteService,
} from './services/ecommerce-route.service';
import { EcSidebarsComponent } from './navigation/ec-sidebars/ec-sidebars.component';
import { EcToolbarComponent } from './navigation/ec-toolbar/ec-toolbar.component';
import { EcFooterComponent } from './ec-footer/ec-footer.component';

@Component({
  selector: 'app-ec-main',
  standalone: true,
  imports: [
    EcToolbarComponent,
    EcFooterComponent,
    EcSidebarsComponent,
    RouterOutlet,
  ],
  templateUrl: './ec-main.component.html',
  styleUrls: ['./ec-main.component.scss'],
  animations: [inOutAnimation],
})
export class EcMainComponent {
  readonly breakpointObserverService = inject(BreakpointObserverService);
  private readonly _eCommerceRouteService = inject(ECommerceRouteService);

  readonly eCommerceRouteSection =
    this._eCommerceRouteService.currentRouteSection;

  readonly ECommerceRouteSection = ECommerceRouteSection;
}
