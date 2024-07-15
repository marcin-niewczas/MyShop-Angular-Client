import { Component } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CategoryEcService } from '../services/category-ec.service';
import { MatDividerModule } from '@angular/material/divider';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { inAnimation } from '../../../shared/components/animations';

@Component({
  selector: 'app-ec-product-list-invalid-filter-params',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterModule,
    UpperCasePipe,
    MatDividerModule,
    LoadingComponent,
  ],
  templateUrl: './ec-product-list-invalid-filter-params.component.html',
  styleUrl: './ec-product-list-invalid-filter-params.component.scss',
  animations: [inAnimation],
})
export class EcProductListInvalidFilterParamsComponent {
  readonly categories = this._categoryEcService.categories;

  constructor(private readonly _categoryEcService: CategoryEcService) {}
}
