import { Component, inject, input, model, output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ProductOptionMp } from '../../models/product-option/product-option-mp.interface';
import { ProductOptionType } from '../../../../shared/models/product-option/product-option-type.enum';
import { GetPagedProductOptionsMpSortBy } from '../../models/query-sort-by/get-paged-product-options-mp-sort-by.enum';
import { DatePipe } from '@angular/common';
import { MatSortModule, Sort } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import {
  inAnimation,
  inOutAnimation,
} from '../../../../shared/components/animations';
import {
  SortDirection,
  mapToMatSortDirection,
} from '../../../../shared/models/requests/query-models/common/sort-direction.enum';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';

@Component({
  selector: 'app-mp-desktop-product-options-list',
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
  templateUrl: './mp-desktop-product-options-list.component.html',
  styleUrl: './mp-desktop-product-options-list.component.scss',
  animations: [inAnimation, inOutAnimation],
})
export class MpDesktopProductOptionsListComponent {
  readonly data = input.required<ProductOptionMp[]>();
  readonly isLoadData = input.required<boolean>();
  readonly totalCount = input.required<number>();
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );

  readonly isXLargeScreen = this._breakpointObserverService.isXLargeScreen;

  readonly appliedFiltersCount = input.required<number>();
  readonly sortBy = model<string | undefined>(
    GetPagedProductOptionsMpSortBy.CreatedAt,
  );
  readonly sortDirection = model<SortDirection | undefined>(SortDirection.Asc);
  readonly searchPhrase = model.required<string | undefined>();

  readonly ProductOptionType = ProductOptionType;
  readonly ProductOptionsMpSortBy = GetPagedProductOptionsMpSortBy;

  readonly displayedColumns = [
    'Name',
    'ProductOptionType',
    'ProductOptionSubtype',
    'ProductOptionSortType',
    'CreatedAt',
    'UpdatedAt',
  ];

  readonly mapToMatSortDirection = mapToMatSortDirection;
  readonly sortChange = output();

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
