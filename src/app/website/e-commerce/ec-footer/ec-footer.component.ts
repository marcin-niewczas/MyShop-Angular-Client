import { Component, inject } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../authenticate/auth.service';
import { CategoryEcService } from '../services/category-ec.service';
import { ShopInfo } from '../../../shared/models/shop-info.class';

@Component({
  selector: 'app-ec-footer',
  standalone: true,
  imports: [
    MatGridListModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    FontAwesomeModule,
    RouterLink,
  ],
  templateUrl: './ec-footer.component.html',
  styleUrls: ['./ec-footer.component.scss'],
})
export class EcFooterComponent {
  private readonly _authService = inject(AuthService);
  private readonly _categoryEcService = inject(CategoryEcService);

  readonly currentYear = new Date().getFullYear();
  readonly facebookIcon = faFacebookF;
  readonly instagramIcon = faInstagram;

  readonly hasCustomerPermission = this._authService.hasCustomerPermission;
  readonly categories = this._categoryEcService.categories;

  readonly ShopInfo = ShopInfo;
}
