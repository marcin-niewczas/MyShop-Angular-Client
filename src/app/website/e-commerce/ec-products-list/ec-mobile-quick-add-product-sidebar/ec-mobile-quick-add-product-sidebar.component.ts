import { Component, inject, model, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, NgClass, NgStyle } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { ProductVariantEc } from '../../models/product/product-variant-ec.interface';
import {
  inAnimation,
  inOutAnimation,
} from '../../../../shared/components/animations';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../../shared/components/photo/photo.component';
import {
  SidebarComponent,
  sidebarAnimationDuration,
} from '../../../../shared/components/sidebar/sidebar.component';
import { SmallStarRatingComponent } from '../../../../shared/components/small-star-rating/small-star-rating.component';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { ProductListItemEc } from '../../models/product/product-list-item-ec.interface';

@Component({
  selector: 'app-ec-mobile-quick-add-product-sidebar',
  standalone: true,
  imports: [
    SidebarComponent,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    PhotoComponent,
    SmallStarRatingComponent,
    CurrencyPipe,
    MatDividerModule,
    NgClass,
    NgStyle,
    MatRippleModule,
  ],
  templateUrl: './ec-mobile-quick-add-product-sidebar.component.html',
  styleUrl: './ec-mobile-quick-add-product-sidebar.component.scss',
  animations: [inAnimation, inOutAnimation],
})
export class EcMobileQuickAddProductSidebarComponent {
  readonly breakpointObserverService = inject(BreakpointObserverService);
  readonly chosenProduct = model.required<ProductListItemEc | undefined>();
  readonly chooseProductVariant = output<ProductVariantEc>();

  onCloseSidebar() {
    setTimeout(
      () => this.chosenProduct.set(undefined),
      sidebarAnimationDuration,
    );
  }

  onChooseProductVariant(productVariant: ProductVariantEc) {
    this.chooseProductVariant.emit(productVariant);
  }
}
