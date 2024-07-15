import {
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ProductOptionMp } from '../../models/product-option/product-option-mp.interface';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { inAnimation, inOutAnimation } from '../../../../shared/components/animations';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { SortDirectionIconButtonComponent } from '../../../../shared/components/sort-direction-icon-button/sort-direction-icon-button.component';
import { ProductOptionType } from '../../../../shared/models/product-option/product-option-type.enum';
import { TitleCaseFromStringPipe } from '../../../../shared/pipes/title-case-from-enum-key.pipe';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { GetPagedProductOptionsMpSortBy } from '../../models/query-sort-by/get-paged-product-options-mp-sort-by.enum';
import { SortDirection } from '../../../../shared/models/requests/query-models/common/sort-direction.enum';

@Component({
  selector: 'app-mp-mobile-product-options-list',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatDividerModule,
    MatPaginatorModule,
    SidebarComponent,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    KeyValuePipe,
    TitleCaseFromStringPipe,
    SortDirectionIconButtonComponent,
    MatBadgeModule,
  ],
  templateUrl: './mp-mobile-product-options-list.component.html',
  styleUrl: './mp-mobile-product-options-list.component.scss',
  animations: [inAnimation, inOutAnimation],
})
export class MpMobileProductOptionsListComponent {
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  readonly isXSmallScreen = this._breakpointObserverService.isXSmallScreen;

  @Output() readonly clearFiltersClick = new EventEmitter<void>();

  readonly data = input.required<ProductOptionMp[]>();
  readonly isLoadData = input.required<boolean>();
  readonly totalCount = input.required<number>();

  readonly sortBy = model.required<string | undefined>();
  readonly sortDirection = model.required<SortDirection | undefined>();

  readonly searchPhrase = model.required<string | undefined>();

  readonly appliedFiltersCount = input.required<number>();

  readonly ProductOptionType = ProductOptionType;
  readonly ProductOptionsMpSortBy = GetPagedProductOptionsMpSortBy;

  readonly filtersOpened = signal(false);

  @Output() readonly sortChange = new EventEmitter();

  onSortByChange() {
    this.sortChange.emit();
  }

  onSortDirectionChange(sortDirection?: SortDirection) {
    this.sortDirection.set(sortDirection);
    this.sortChange.emit();
  }
}
