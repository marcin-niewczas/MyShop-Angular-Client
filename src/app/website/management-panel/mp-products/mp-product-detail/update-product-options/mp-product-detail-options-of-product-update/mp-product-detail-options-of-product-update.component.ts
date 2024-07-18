import {
  Component,
  Signal,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  Observable,
  Subject,
  concatMap,
  delay,
  finalize,
  forkJoin,
  map,
  merge,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { MpProductDetailOptionsOfProductUpdateResolvedData } from './mp-product-detail-options-of-product-update.resolver';
import {
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  FormBuilder,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatSelectModule } from '@angular/material/select';
import { inAnimation } from '../../../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../../../shared/components/loading/loading.component';
import {
  SidebarComponent,
  sidebarAnimationDuration,
} from '../../../../../../shared/components/sidebar/sidebar.component';
import { MatSelectInfiniteScrollContainerDirective } from '../../../../../../shared/directives/mat-select-infinite-scroll-container.directive';
import { catchHttpError } from '../../../../../../shared/helpers/pipe-helpers';
import { ValuePosition } from '../../../../../../shared/models/helpers/value-position.interface';
import { PaginationQueryParams } from '../../../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { SortDirection } from '../../../../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiPagedResponse } from '../../../../../../shared/models/responses/api-paged-response.interface';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { ProductOptionValueMp } from '../../../../models/product-option-value/product-option-value-mp.interface';
import { ProductDetailOptionOfProductMp } from '../../../../models/product-option/details/product-detail-option-of-product-mp.interface';
import { ProductOptionMp } from '../../../../models/product-option/product-option-mp.interface';
import { CreateProductProductDetailOptionValueMp } from '../../../../models/product-product-detail-option-value/create-product-product-detail-option-value-mp.class';
import { UpdateProductProductDetailOptionValueMp } from '../../../../models/product-product-detail-option-value/update-product-product-detail-option-value-mp.class';
import { UpdateProductOptionsPositionsOfProductMp } from '../../../../models/product/update-product-options-positions-of-product-mp.class';
import { GetPagedProductOptionValuesByProductOptionIdMpQueryParams } from '../../../../models/query-params/get-paged-product-option-values-by-product-option-id-mp-query-params.interface';
import { GetPagedProductOptionsMpQueryParams } from '../../../../models/query-params/get-paged-product-options-mp-query-params.interface';
import { GetPagedProductOptionsMpSortBy } from '../../../../models/query-sort-by/get-paged-product-options-mp-sort-by.enum';
import { ProductOptionTypeMpQueryType } from '../../../../models/query-types/product-option-type-mp-query-type.enum';
import { ProductOptionsSubtypeMpQueryType } from '../../../../models/query-types/product-options-mp-query-type.enum';
import { ProductMpService } from '../../../../services/product-mp.service';
import { ProductOptionMpService } from '../../../../services/product-option-mp.service';
import { ProductProductDetailOptionValueMpService } from '../../../../services/product-product-detail-option-value-mp.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getProductOptionTypeDescription } from '../../../../helpers/management-panel-helper-functions';
import { ProductOptionType } from '../../../../../../shared/models/product-option/product-option-type.enum';

@Component({
  selector: 'app-mp-product-detail-options-of-product-update',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatDividerModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    LoadingComponent,
    MatSelectModule,
    FormsModule,
    InfiniteScrollDirective,
    MatSelectInfiniteScrollContainerDirective,
    SidebarComponent,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
  templateUrl: './mp-product-detail-options-of-product-update.component.html',
  styleUrl: './mp-product-detail-options-of-product-update.component.scss',
  animations: [inAnimation],
})
export class MpProductDetailOptionsOfProductUpdateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _productMpService = inject(ProductMpService);
  private readonly _toastService = inject(ToastService);
  private readonly _productProductDetailOptionValueMpService = inject(
    ProductProductDetailOptionValueMpService,
  );
  private readonly _productOptionMpService = inject(ProductOptionMpService);
  private readonly _formBuilder = inject(FormBuilder);

  readonly addProductDetailOptionNgFormViewChild = viewChild.required<NgForm>(
    'addProductDetailOptionNgForm',
  );

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Products', routerLink: '../' },
  ];

  readonly addAdditionalProductOptionFormGroup = this._formBuilder.group({
    optionId: this._formBuilder.control(
      null as string | null,
      Validators.required,
    ),
    valueId: this._formBuilder.control(
      null as string | null,
      Validators.required,
    ),
  });

  readonly productOptionTypeDescription = getProductOptionTypeDescription(
    ProductOptionType.Detail,
  );

  mainOption!: ProductDetailOptionOfProductMp;
  additionalOptions!: ProductDetailOptionOfProductMp[];

  additionalOptionsChanged?: ProductDetailOptionOfProductMp[];

  private _reloadProductDetailOptionsQueryParams!: PaginationQueryParams;

  private _reloadProductDetailsSubject = new Subject<string>();

  readonly product = toSignal(
    merge(
      this._activatedRoute.data.pipe(
        map(({ mpProductDetailOptionsOfProductUpdateResolvedData }) => {
          const data =
            mpProductDetailOptionsOfProductUpdateResolvedData as MpProductDetailOptionsOfProductUpdateResolvedData;

          this.mainOption = data.mainProductDetailOption;
          this.additionalOptions = data.additionalProductDetailOptions;
          this._reloadProductDetailOptionsQueryParams = data.queryParams;

          return data.product;
        }),
      ),
      this._reloadProductDetailsSubject.pipe(
        switchMap((id) =>
          this._productMpService
            .getById(id)
            .pipe(map((response) => response.data)),
        ),
      ),
    ).pipe(
      map((product) => {
        if (this.breadcrumbsItems.length <= 1) {
          this.breadcrumbsItems.push(
            ...[
              { label: product.fullName, routerLink: '../../' },
              { label: 'Update Product Detail Options' },
            ],
          );
        } else {
          this.breadcrumbsItems[1] = {
            label: product.fullName,
            routerLink: '../../',
          };
        }

        return product;
      }),
    ),
  );

  private readonly _reloadProductDetailOptionsSubject = new Subject<void>();

  readonly isReloadProductDetailOptions = signal(false);

  private readonly _reloadProductDetailOptionsTask = toSignal(
    this._reloadProductDetailOptionsSubject.pipe(
      tap(() => {
        this.isReloadProductDetailOptions.set(true);
        this._reloadProductDetailOptionsQueryParams.pageNumber = 1;
      }),
      switchMap(() =>
        this._productMpService
          .getPagedProductDetailOptionsByProductId(
            this.product()!.id,
            this._reloadProductDetailOptionsQueryParams,
          )
          .pipe(
            switchMap((firstResponse) => {
              if (firstResponse.isNext) {
                const taskList: Observable<
                  ApiPagedResponse<ProductDetailOptionOfProductMp>
                >[] = [];

                for (let i = 2; i <= firstResponse.totalCount; i++) {
                  this._reloadProductDetailOptionsQueryParams.pageNumber += 1;
                  taskList.push(
                    this._productMpService.getPagedProductDetailOptionsByProductId(
                      this.product()!.id,
                      this._reloadProductDetailOptionsQueryParams,
                    ),
                  );
                }

                return forkJoin(taskList).pipe(
                  map((responses) => [
                    ...firstResponse.data,
                    ...responses.flatMap((x) => x.data),
                  ]),
                  tap((productDetailOptions) => {
                    this.mainOption = productDetailOptions[0];
                    this.additionalOptions = productDetailOptions.splice(
                      1,
                      productDetailOptions.length,
                    );
                    this.additionalOptionsChanged = undefined;
                  }),
                  finalize(() => this.resetProcessState()),
                );
              }

              return of(firstResponse.data).pipe(
                tap((productDetailOptions) => {
                  this.mainOption = productDetailOptions[0];
                  this.additionalOptions = productDetailOptions.splice(
                    1,
                    productDetailOptions.length,
                  );
                  this.additionalOptionsChanged = undefined;
                }),
                finalize(() => this.resetProcessState()),
              );
            }),
          ),
      ),
    ),
  );

  readonly isSavePositionsProcess = signal(false);

  private readonly _isSavePositionsSubject =
    new Subject<UpdateProductOptionsPositionsOfProductMp>();

  private readonly _idSavePositionsTask = toSignal(
    this._isSavePositionsSubject.pipe(
      switchMap((model) =>
        this._productMpService
          .saveProductDetailOptionsPositionsOfProduct(model)
          .pipe(
            tap(() => {
              this._toastService.success(
                'Positions of Product Detail Options has been updated.',
              );

              this._reloadProductDetailOptionsSubject.next();
            }),
            catchHttpError(this._toastService, () =>
              this.isSavePositionsProcess.set(false),
            ),
          ),
      ),
    ),
  );

  readonly currentIdRemove = signal<string | undefined>(undefined);

  private readonly _removeProductDetailOptionOfProductSubject =
    new Subject<string>();

  private readonly _removeProductDetailOptionOfProductTask = toSignal(
    this._removeProductDetailOptionOfProductSubject.pipe(
      tap((id) => this.currentIdRemove.set(id)),
      switchMap((id) =>
        this._productProductDetailOptionValueMpService
          .removeProductDetailOptionOfProduct(id)
          .pipe(
            tap(() => {
              this._reloadProductDetailOptionsSubject.next();
              this._toastService.success(
                'The Additional Product Detail Option has been removed.',
              );
            }),
            catchHttpError(this._toastService, () =>
              this.currentIdRemove.set(undefined),
            ),
          ),
      ),
    ),
  );

  readonly currentProductDetailOptionUpdateMode = signal<
    ProductDetailOptionOfProductMp | undefined
  >(undefined);
  readonly isUpdateProcess = signal(false);

  private readonly _updateProductDetailOptionOfProductSubject =
    new Subject<UpdateProductProductDetailOptionValueMp>();

  private readonly _updateProductDetailOptionOfProductTask = toSignal(
    this._updateProductDetailOptionOfProductSubject.pipe(
      tap(() => this.isUpdateProcess.set(true)),
      switchMap((model) =>
        this._productProductDetailOptionValueMpService
          .updateProductProductDetailOptionValue(model)
          .pipe(
            tap(() => {
              this._reloadProductDetailOptionsSubject.next();

              if (model.id === this.mainOption.id) {
                const productId = this.product()?.id;

                if (productId) {
                  this._reloadProductDetailsSubject.next(productId);
                }
              }

              this._toastService.success(
                'The Product Detail Option Value has been updated.',
              );
            }),
            catchHttpError(this._toastService, () =>
              this.isUpdateProcess.set(false),
            ),
          ),
      ),
    ),
  );

  readonly isProcess = computed(
    () =>
      this.isSavePositionsProcess() ||
      this.isReloadProductDetailOptions() ||
      this.currentIdRemove() != undefined ||
      this.isUpdateProcess() ||
      this.isAddProcess(),
  );

  readonly isLoadProductDetailOptionValuesForUpdate = signal(false);
  readonly isNextPageProductDetailOptionValuesForUpdate = signal(false);
  private readonly _loadMoreProductDetailOptionValuesForUpdateSubject =
    new Subject<{
      data: Signal<ProductOptionValueMp[] | undefined>;
      productDetailOptionId: string;
    }>();

  readonly _getPagedProductOptionValuesByProductOptionIdMpForUpdateQueryParams: GetPagedProductOptionValuesByProductOptionIdMpQueryParams =
    {
      pageNumber: 0,
      pageSize: 10,
    };

  readonly valuesForUpdate = toSignal(
    merge(
      toObservable(this.currentProductDetailOptionUpdateMode).pipe(
        map((value) => value?.productOptionId),
      ),
      this._loadMoreProductDetailOptionValuesForUpdateSubject,
    ).pipe(
      concatMap((value) => {
        if (value != undefined) {
          this.isLoadProductDetailOptionValuesForUpdate.set(true);
          this._getPagedProductOptionValuesByProductOptionIdMpForUpdateQueryParams.pageNumber += 1;

          return this._productOptionMpService
            .getPagedProductOptionValuesByProductOptionId(
              typeof value === 'string' ? value : value.productDetailOptionId,
              this
                ._getPagedProductOptionValuesByProductOptionIdMpForUpdateQueryParams,
            )
            .pipe(
              map((response) => {
                this.isNextPageProductDetailOptionValuesForUpdate.set(
                  response.isNext,
                );

                if (typeof value === 'string') {
                  return response.data;
                }

                const currentValues = value.data();

                if (currentValues) {
                  currentValues.push(...response.data);

                  return currentValues;
                }

                return response.data;
              }),
              finalize(() =>
                this.isLoadProductDetailOptionValuesForUpdate.set(false),
              ),
            );
        }

        this._getPagedProductOptionValuesByProductOptionIdMpForUpdateQueryParams.pageNumber = 0;
        return of(undefined);
      }),
    ),
  );

  readonly addAdditionalOptionDialogOpened = signal(false);

  readonly isLoadProductDetailOptionForAdd = signal(false);
  readonly isNextPageProductDetailOptionForAdd = signal(false);
  private readonly _loadMoreProductDetailOptionsForAddSubject = new Subject<
    Signal<{ disabled: boolean; data: ProductOptionMp }[] | undefined>
  >();

  readonly _getPagedProductOptionByProductOptionIdMpForAddQueryParams: GetPagedProductOptionsMpQueryParams =
    {
      pageNumber: 0,
      pageSize: 10,
      queryType: ProductOptionTypeMpQueryType.Detail,
      subqueryType: ProductOptionsSubtypeMpQueryType.Additional,
      sortBy: GetPagedProductOptionsMpSortBy.Name,
      sortDirection: SortDirection.Asc,
    };

  readonly optionsForAdd = toSignal(
    merge(
      toObservable(this.addAdditionalOptionDialogOpened).pipe(
        map((opened) => opened),
      ),
      this._loadMoreProductDetailOptionsForAddSubject,
    ).pipe(
      concatMap((value) => {
        if (value !== false) {
          this.isLoadProductDetailOptionForAdd.set(true);
          this._getPagedProductOptionByProductOptionIdMpForAddQueryParams.pageNumber += 1;

          return this._productOptionMpService
            .getPagedData(
              this._getPagedProductOptionByProductOptionIdMpForAddQueryParams,
            )
            .pipe(
              map((response) => {
                this.isNextPageProductDetailOptionForAdd.set(response.isNext);

                const tranformedResponseData: {
                  disabled: boolean;
                  data: ProductOptionMp;
                }[] = [];

                response.data.forEach((i) => {
                  if (
                    this.additionalOptions.some(
                      (x) => x.productOptionId === i.id,
                    )
                  ) {
                    tranformedResponseData.push({ disabled: true, data: i });
                  } else {
                    tranformedResponseData.push({ disabled: false, data: i });
                  }
                });

                if (value !== true) {
                  const currentValues = value();

                  if (currentValues) {
                    currentValues.push(...tranformedResponseData);
                  }

                  return currentValues;
                }

                return tranformedResponseData;
              }),
              finalize(() => this.isLoadProductDetailOptionForAdd.set(false)),
            );
        }

        this._getPagedProductOptionByProductOptionIdMpForAddQueryParams.pageNumber = 0;
        return of(undefined).pipe(delay(sidebarAnimationDuration));
      }),
    ),
  );

  readonly isLoadProductDetailOptionValuesForAdd = signal(false);
  readonly isNextPageProductDetailOptionValuesForAdd = signal(false);
  private readonly _loadMoreProductDetailOptionValuesForAddSubject =
    new Subject<{
      data: Signal<ProductOptionValueMp[] | undefined>;
      productDetailOptionId: string;
      isReset: boolean;
    }>();

  readonly _getPagedProductOptionValuesByProductOptionIdMpForAddQueryParams: GetPagedProductOptionValuesByProductOptionIdMpQueryParams =
    {
      pageNumber: 0,
      pageSize: 10,
    };

  readonly valuesForAdd = toSignal(
    merge(
      toObservable(this.addAdditionalOptionDialogOpened).pipe(
        map(() => undefined),
      ),
      this._loadMoreProductDetailOptionValuesForAddSubject,
    ).pipe(
      concatMap((value) => {
        if (value != undefined) {
          this.isLoadProductDetailOptionValuesForAdd.set(true);

          if (value.isReset) {
            this._getPagedProductOptionValuesByProductOptionIdMpForAddQueryParams.pageNumber = 1;
          } else {
            this._getPagedProductOptionValuesByProductOptionIdMpForAddQueryParams.pageNumber += 1;
          }

          return this._productOptionMpService
            .getPagedProductOptionValuesByProductOptionId(
              value.productDetailOptionId,
              this
                ._getPagedProductOptionValuesByProductOptionIdMpForAddQueryParams,
            )
            .pipe(
              map((response) => {
                this.isLoadProductDetailOptionValuesForAdd.set(response.isNext);

                if (value.isReset) {
                  return response.data;
                }

                const currentValues = value.data();

                if (currentValues) {
                  currentValues.push(...response.data);

                  return currentValues;
                }

                return response.data;
              }),
              finalize(() =>
                this.isLoadProductDetailOptionValuesForAdd.set(false),
              ),
            );
        }

        this._getPagedProductOptionValuesByProductOptionIdMpForAddQueryParams.pageNumber = 0;
        return of(undefined).pipe(delay(sidebarAnimationDuration));
      }),
    ),
  );

  readonly isAddProcess = signal(false);

  private readonly _addProductDetailOptionToProductSubject =
    new Subject<CreateProductProductDetailOptionValueMp>();

  private readonly _addProductDetailOptionToProductTask = toSignal(
    this._addProductDetailOptionToProductSubject.pipe(
      tap(() => this.isAddProcess.set(true)),
      switchMap((model) =>
        this._productProductDetailOptionValueMpService
          .createProductProductDetailOptionValue(model)
          .pipe(
            tap(() => {
              this._reloadProductDetailOptionsSubject.next();
              this._toastService.success(
                'The Product Detail Option Value has been added.',
              );
              this.addAdditionalOptionDialogOpened.set(false);
            }),
            catchHttpError(this._toastService, () =>
              this.isAddProcess.set(false),
            ),
          ),
      ),
    ),
  );

  drop(event: CdkDragDrop<ProductDetailOptionOfProductMp[]>) {
    if (!this.additionalOptionsChanged && this.additionalOptions) {
      this.additionalOptionsChanged = [...this.additionalOptions];
    }

    if (this.additionalOptionsChanged) {
      moveItemInArray(
        this.additionalOptionsChanged,
        event.previousIndex,
        event.currentIndex,
      );

      if (
        JSON.stringify(this.additionalOptionsChanged) ===
        JSON.stringify(this.additionalOptions)
      ) {
        this.additionalOptionsChanged = undefined;
      }
    }
  }

  savePositions() {
    if (!this.additionalOptions || !this.additionalOptionsChanged) {
      return;
    }

    const idPositions: ValuePosition<string>[] = [];

    this.additionalOptionsChanged.forEach((item, index) => {
      if (
        this.additionalOptions &&
        this.additionalOptions[index].id !== item.id
      ) {
        idPositions.push({ value: item.id, position: index + 1 });
      }
    });

    const productId = this.product()?.id;

    if (productId) {
      this.isSavePositionsProcess.set(true);
      this._isSavePositionsSubject.next(
        new UpdateProductOptionsPositionsOfProductMp(productId, idPositions),
      );
    }
  }

  removeProductDetailOptionOfProduct(id: string) {
    this._removeProductDetailOptionOfProductSubject.next(id);
  }

  loadMoreProductDetailOptionValuesForUpdate() {
    const productDetailOptionId =
      this.currentProductDetailOptionUpdateMode()?.productOptionId;

    if (productDetailOptionId) {
      this._loadMoreProductDetailOptionValuesForUpdateSubject.next({
        data: this.valuesForUpdate,
        productDetailOptionId,
      });
    }
  }

  loadMoreProductDetailOptionsForAdd() {
    this._loadMoreProductDetailOptionsForAddSubject.next(this.optionsForAdd);
  }

  loadMoreProductDetailOptionValuesForAdd(isReset: boolean) {
    const productDetailOptionId =
      this.addAdditionalProductOptionFormGroup.controls.optionId.value;

    if (productDetailOptionId) {
      this._loadMoreProductDetailOptionValuesForAddSubject.next({
        data: this.valuesForAdd,
        productDetailOptionId,
        isReset,
      });

      if (isReset) {
        this.addAdditionalProductOptionFormGroup.controls.valueId.enable();
      }
    }
  }

  updateProductDetailOptionOfProduct(id: string, valueId: string) {
    this._updateProductDetailOptionOfProductSubject.next(
      new UpdateProductProductDetailOptionValueMp(id, valueId),
    );
  }

  openAddAdditionalOptionDialog() {
    this.addProductDetailOptionNgFormViewChild().resetForm();
    this.addAdditionalProductOptionFormGroup.controls.valueId.disable();
    this.addAdditionalOptionDialogOpened.set(true);
  }

  addProductDetailOption() {
    if (!this.addAdditionalProductOptionFormGroup.valid) {
      return;
    }

    const value = this.addAdditionalProductOptionFormGroup.value;

    this._addProductDetailOptionToProductSubject.next(
      new CreateProductProductDetailOptionValueMp(
        this.product()?.id!,
        value.valueId!,
      ),
    );
  }

  private resetProcessState() {
    this.isReloadProductDetailOptions.set(false);
    this.currentIdRemove.set(undefined);
    this.currentProductDetailOptionUpdateMode.set(undefined);
    this.isUpdateProcess.set(false);
    this.isSavePositionsProcess.set(false);
    this.isAddProcess.set(false);
  }
}
