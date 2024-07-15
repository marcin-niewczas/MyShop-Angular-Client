import {
  Component,
  ElementRef,
  OnChanges,
  SimpleChanges,
  inject,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RouterLink } from '@angular/router';

import { ProductEcService } from '../../../services/product-ec.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  debounce,
  filter,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
  timer,
} from 'rxjs';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CurrencyPipe, NgClass } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import {
  inOutAnimation,
  slideFromTopAnimation,
  inAnimation,
} from '../../../../../shared/components/animations';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../../../shared/components/photo/photo.component';
import { BaseNavCloseSidebar } from '../../../../../shared/components/sidebar/base-nav-close-sidebar.class';
import {
  SidebarComponent,
  sidebarAnimationDuration,
} from '../../../../../shared/components/sidebar/sidebar.component';
import { SmallStarRatingComponent } from '../../../../../shared/components/small-star-rating/small-star-rating.component';
import { FocusElementDirective } from '../../../../../shared/directives/focus-element.directive';
import {
  isNullOrWhitespace,
  nameof,
} from '../../../../../shared/functions/helper-functions';
import { ShopInfo } from '../../../../../shared/models/shop-info.class';
import { LimitStringPipe } from '../../../../../shared/pipes/limit-string.pipe';
import { BreakpointObserverService } from '../../../../../shared/services/breakpoint-observer.service';
import { ProductListItemEc } from '../../../models/product/product-list-item-ec.interface';
import { GetPagedProductsEcQueryParams } from '../../../models/query-params/get-paged-products-ec-query-params.interface';
import { GetProductsNamesEcQueryParams } from '../../../models/query-params/get-products-names-ec-query-params.interface';
import { GetPagedProductsEcSortBy } from '../../../models/query-sort-by/get-paged-products-ec-sort-by.enum';

@Component({
  selector: 'app-ec-sidebar-search',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    FormsModule,
    FocusElementDirective,
    LoadingComponent,
    SmallStarRatingComponent,
    RouterLink,
    SidebarComponent,
    ReactiveFormsModule,
    LoadingComponent,
    LimitStringPipe,
    PhotoComponent,
    CurrencyPipe,
    NgClass,
  ],
  templateUrl: './ec-sidebar-search.component.html',
  styleUrls: ['./ec-sidebar-search.component.scss'],
  animations: [
    inOutAnimation,
    slideFromTopAnimation,
    inAnimation,
    trigger('expand', [
      state('void', style({ height: '0', overflow: 'hidden' })),
      transition(':enter', [
        animate('300ms ease-in-out', style({ height: '*' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ height: '0' })),
      ]),
    ]),
  ],
})
export class EcSidebarSearchComponent
  extends BaseNavCloseSidebar
  implements OnChanges
{
  readonly searchInput = viewChild.required<ElementRef>('searchInput');
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _productEcService = inject(ProductEcService);

  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;
  override readonly opened = model(false);
  readonly isLoadData = signal(false);
  readonly products = signal<ProductListItemEc[] | undefined>(undefined);

  readonly searchPhraseControl = this._formBuilder.control('');
  readonly ShopInfo = ShopInfo;

  readonly getProductsNamesQueryParams: GetProductsNamesEcQueryParams = {
    take: 5,
    searchPhrase: '',
  };

  readonly getPagedProductsEcQueryParams: GetPagedProductsEcQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: GetPagedProductsEcSortBy.Newest,
  };

  readonly currentSearchPhrase = signal<string | null>(null);

  readonly suggestedProductNames = toSignal(
    this.searchPhraseControl.valueChanges.pipe(
      filter(
        (value) =>
          !this.currentSearchPhrase() ||
          this.currentSearchPhrase()?.trim() !== value?.trim(),
      ),
      debounce((value) =>
        value == undefined || value.length <= 1 ? of(undefined) : timer(300),
      ),
      tap((value) => {
        if (value && value?.length >= 2) this.isLoadData.set(true);
      }),
      switchMap((value) => {
        if (isNullOrWhitespace(value) || value.length <= 1) {
          this.products.set(undefined);
          this.currentSearchPhrase.set(null);
          this.isLoadData.set(false);
          return of(undefined);
        }

        this.getProductsNamesQueryParams.searchPhrase = value;
        this.getPagedProductsEcQueryParams.searchPhrase = value;

        return forkJoin([
          this._productEcService
            .getProductsNames(this.getProductsNamesQueryParams)
            .pipe(
              map((response) => {
                const data = response.data.value;

                const lowerSearchPhrase = value.toLowerCase();
                let tempLowerSuggestedName: string;
                let tempIndex: number;

                let tempArray: { value: string; distinguish: boolean }[] = [];
                const splittedData = new Map<
                  string,
                  { value: string; distinguish: boolean }[]
                >();

                data.forEach((name) => {
                  tempLowerSuggestedName = name.toLowerCase();
                  tempIndex = tempLowerSuggestedName.indexOf(lowerSearchPhrase);

                  if (tempIndex === -1) {
                    tempArray.push({ value: name, distinguish: false });
                  } else {
                    while (tempIndex !== -1) {
                      if (tempIndex > 0) {
                        tempArray.push({
                          value: name.slice(
                            name.length - tempLowerSuggestedName.length,
                            name.length -
                              tempLowerSuggestedName.length +
                              tempIndex,
                          ),
                          distinguish: false,
                        });
                        tempLowerSuggestedName =
                          tempLowerSuggestedName.slice(tempIndex);
                      }

                      tempArray.push({
                        value: name.slice(
                          name.length - tempLowerSuggestedName.length,
                          name.length -
                            tempLowerSuggestedName.length +
                            lowerSearchPhrase.length,
                        ),
                        distinguish: true,
                      });

                      tempLowerSuggestedName = tempLowerSuggestedName.slice(
                        lowerSearchPhrase.length,
                      );

                      tempIndex =
                        tempLowerSuggestedName.indexOf(lowerSearchPhrase);

                      if (
                        tempIndex === -1 &&
                        tempLowerSuggestedName.length > 0
                      ) {
                        tempArray.push({
                          value: name.slice(
                            name.length - tempLowerSuggestedName.length,
                          ),
                          distinguish: false,
                        });
                      }
                    }
                  }

                  splittedData.set(name, tempArray);
                  tempArray = [];
                });
                return splittedData;
              }),
            ),
          this._productEcService
            .getPagedProductListItems(this.getPagedProductsEcQueryParams)
            .pipe(map((response) => this.products.set(response.data))),
        ]).pipe(
          map(([suggestedProductNames]) => {
            this.currentSearchPhrase.set(value);
            this.isLoadData.set(false);
            return suggestedProductNames;
          }),
        );
      }),
    ),
  );

  ngOnChanges(changes: SimpleChanges): void {
    const currentOpenedChange =
      changes[nameof<EcSidebarSearchComponent>('opened')];
    if (currentOpenedChange && currentOpenedChange.currentValue) {
      setTimeout(
        () => this.searchInput().nativeElement.focus(),
        sidebarAnimationDuration,
      );
    }

    if (currentOpenedChange && !currentOpenedChange.currentValue) {
      setTimeout(
        () => this.searchPhraseControl.setValue(null),
        sidebarAnimationDuration,
      );
    }
  }

  onClickLogo() {
    if (this._router.url === '/') {
      this.opened.set(false);
    } else {
      this.clickedNavItemSubject.next();
    }
  }
}
