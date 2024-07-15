import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ShoppingCartEcService } from '../../../services/shopping-cart-ec.service';

@Component({
  selector: 'app-ec-shopping-cart-button',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './ec-shopping-cart-button.component.html',
})
export class EcShoppingCartButtonComponent {
  private readonly _shoppingCartEcService = inject(ShoppingCartEcService);

  readonly totalQuantity = this._shoppingCartEcService.totalQuantity;
  readonly shoppingCartChanges =
    this._shoppingCartEcService.shoppingCartChanges;
  readonly opened = this._shoppingCartEcService.shoppingCartOpened;
}
