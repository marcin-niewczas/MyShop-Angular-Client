import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { inAnimation, inOutAnimation } from '../../../../shared/components/animations';
import { SortDirection, mapToMatSortDirection } from '../../../../shared/models/requests/query-models/common/sort-direction.enum';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { ProductMp } from '../../models/product/product-mp.interface';
import { GetPagedProductOptionsMpSortBy } from '../../models/query-sort-by/get-paged-product-options-mp-sort-by.enum';

@Component({
  selector: 'app-mp-desktop-products-list',
  standalone: true,
  imports: [
    MatInputModule,
    MatTableModule,
    DatePipe,
    MatSortModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    RouterLink,
    MatRippleModule,
  ],
  templateUrl: './mp-desktop-products-list.component.html',
  styleUrl: './mp-desktop-products-list.component.scss',
  animations: [inAnimation, inOutAnimation],
})
export class MpDesktopProductsListComponent {
  readonly data = input.required<ProductMp[]>();
  readonly isLoadData = input.required<boolean>();
  readonly totalCount = input.required<number>();
  readonly appliedFiltersCount = input.required<number>();

  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );

  readonly isXLargeScreen = this._breakpointObserverService.isXLargeScreen;

  readonly sortBy = model<string | undefined>(
    GetPagedProductOptionsMpSortBy.CreatedAt,
  );
  readonly sortDirection = model<SortDirection | undefined>(SortDirection.Asc);
  readonly searchPhrase = model.required<string | undefined>();

  readonly displayedColumns = [
    'FullName',
    'Name',
    'Category',
    'CreatedAt',
    'UpdatedAt',
  ];

  readonly mapToMatSortDirection = mapToMatSortDirection;
  @Output() readonly sortChange = new EventEmitter();

  onSortChange(sort: Sort) {
    if (sort.direction === 'asc') {
      this.sortBy.set(sort.active);
      this.sortDirection.set(SortDirection.Asc);
    } else if (sort.direction === 'desc') {
      this.sortBy.set(sort.active);
      this.sortDirection.set(SortDirection.Desc);
    } else {
      this.sortBy.set(undefined);
      this.sortDirection.set(undefined);
    }

    this.sortChange.emit();
  }
}
