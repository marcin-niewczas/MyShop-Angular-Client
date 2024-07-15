import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  CdkDragDrop,
  moveItemInArray,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import {
  EMPTY,
  Observable,
  Subject,
  filter,
  finalize,
  forkJoin,
  map,
  switchMap,
  tap,
} from 'rxjs';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { inAnimation } from '../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { CheckMaxHeightDirective } from '../../../../shared/directives/check-max-height.directive';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ValuePosition } from '../../../../shared/models/helpers/value-position.interface';
import { ProductOptionSortType } from '../../../../shared/models/product-option/product-option-sort-type.enum';
import { ProductOptionSubtype } from '../../../../shared/models/product-option/product-option-subtype.enum';
import { ProductOptionType } from '../../../../shared/models/product-option/product-option-type.enum';
import { ApiPagedResponse } from '../../../../shared/models/responses/api-paged-response.interface';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../shared/validators/custom-validator';
import { CreateProductDetailOptionValueMp } from '../../models/product-option-value/details/create-product-detail-option-value-mp.class';
import { UpdateProductDetailOptionValueMp } from '../../models/product-option-value/details/update-product-detail-option-value-mp.class';
import { ProductOptionValueMp } from '../../models/product-option-value/product-option-value-mp.interface';
import { CreateProductVariantOptionValueMp } from '../../models/product-option-value/variants/create-product-variant-option-value-mp.class';
import { UpdateProductVariantOptionValueMp } from '../../models/product-option-value/variants/update-product-variant-option-value-mp.class';
import { UpdatePositionsOfProductDetailOptionValuesMp } from '../../models/product-option/details/update-positions-of-product-detail-option-values-mp.class';
import { UpdateProductDetailOptionMp } from '../../models/product-option/details/update-product-detail-option-mp.class';
import { ProductOptionMp } from '../../models/product-option/product-option-mp.interface';
import { UpdatePositionsOfProductVariantOptionValuesMp } from '../../models/product-option/variants/update-positions-of-product-variant-option-values-mp.class';
import { UpdateProductVariantOptionMp } from '../../models/product-option/variants/update-product-variant-option-mp.class';
import { GetPagedProductOptionValuesByProductOptionIdMpQueryParams } from '../../models/query-params/get-paged-product-option-values-by-product-option-id-mp-query-params.interface';
import { ProductOptionMpService } from '../../services/product-option-mp.service';
import { ProductOptionValueMpService } from '../../services/product-option-value-mp.service';

@Component({
  selector: 'app-mp-product-option-detail',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    DatePipe,
    LoadingComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    InfiniteScrollDirective,
    CheckMaxHeightDirective,
  ],
  templateUrl: './mp-product-option-detail.component.html',
  styleUrl: './mp-product-option-detail.component.scss',
  animations: [inAnimation],
})
export class MpProductOptionDetailComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _productOptionMpService = inject(ProductOptionMpService);
  private readonly _productOptionValueMpService = inject(
    ProductOptionValueMpService,
  );
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  private readonly _queryParams: GetPagedProductOptionValuesByProductOptionIdMpQueryParams =
    {
      pageNumber: 0,
      pageSize: 10,
    };

  readonly updateProductOptionFormGroup = this._formBuilder.group({
    name: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.productOptionNameParams!,
      ),
    ),
    productOptionSortType: this._formBuilder.control('', Validators.required),
  });

  readonly canUpdateProductOption = toSignal(
    this.updateProductOptionFormGroup.valueChanges.pipe(
      map(
        (formValue) =>
          formValue.name !== this.productOption()?.name ||
          formValue.productOptionSortType !==
            this.productOption()?.productOptionSortType,
      ),
    ),
  );

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Product Options', routerLink: '../' },
  ];

  readonly isLoadProductOptionValues = signal(true);
  readonly productOption = signal<ProductOptionMp | undefined>(undefined);
  readonly isUpdateProductOptionValueProcess = signal(false);
  readonly isCreateProductOptionValueProcess = signal(false);
  readonly isUpdatePositionsProductOptionValueProcess = signal(false);
  readonly isUpdateProductOptionProcess = signal(false);
  readonly isLoadProductOptionCount = signal(false);

  readonly isNextPageProductOptionValues = signal(true);

  readonly isCreateProductOptionValueMode = signal(false);
  readonly isUpdateProductOptionMode = signal(false);

  readonly ProductOptionSortType = ProductOptionSortType;
  readonly ProductOptionSubtype = ProductOptionSubtype;

  productOptionValues: ProductOptionValueMp[] = [];
  changedProductOptionValues?: ProductOptionValueMp[];
  readonly currentEditProductOptionValue = signal<
    ProductOptionValueMp | undefined
  >(undefined);

  get validatorParameters() {
    return this._productOptionMpService.validatorParameters;
  }

  readonly updateProductOptionValueFormGroup = this._formBuilder.group({
    value: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.productOptionValueParams!,
      ),
    ),
  });

  readonly createProductOptionValueFormGroup = this._formBuilder.group({
    value: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.productOptionValueParams!,
      ),
    ),
  });

  readonly canUpdateProductOptionValue = toSignal(
    this.updateProductOptionValueFormGroup.valueChanges.pipe(
      filter((formValue) => !!formValue.value),
      map(
        (formValue) =>
          formValue.value !== this.currentEditProductOptionValue()?.value,
      ),
    ),
  );

  readonly isProcess = computed(
    () =>
      this.isUpdateProductOptionValueProcess() ||
      this.isUpdatePositionsProductOptionValueProcess() ||
      this.isUpdateProductOptionProcess() ||
      this.isCreateProductOptionValueProcess() ||
      this.isProductOptionRemoveProccess() ||
      this.currentProductOptionValueRemoveProcess() != undefined,
  );

  private readonly _loadProductOptionValuesTaskSubject = new Subject<
    'reset' | void
  >();

  private readonly _loadProductOptionValuesTask = toSignal(
    this._loadProductOptionValuesTaskSubject.pipe(
      tap(() => {
        this.isLoadProductOptionValues.set(true);
        this._queryParams.pageNumber += 1;
      }),
      switchMap((value) =>
        this.productOption()?.productOptionSortType ===
        ProductOptionSortType.Custom
          ? this._productOptionMpService
              .getPagedProductOptionValuesByProductOptionId(
                this.productOption()?.id!,
                this._queryParams,
              )
              .pipe(
                switchMap((response) => {
                  this.productOptionValues = response.data;

                  if (!response.isNext) {
                    this.isLoadProductOptionValues.set(false);
                    return EMPTY;
                  }

                  const taskList = [] as Observable<
                    ApiPagedResponse<ProductOptionValueMp>
                  >[];

                  for (let i = 2; i <= response.totalPages; i++) {
                    this._queryParams.pageNumber = i;
                    taskList.push(
                      this._productOptionMpService.getPagedProductOptionValuesByProductOptionId(
                        this.productOption()?.id!,
                        this._queryParams,
                      ),
                    );
                  }

                  return forkJoin(taskList).pipe(
                    tap((responses) => {
                      this.productOptionValues.push(
                        ...responses.flatMap((i) => i.data),
                      );
                    }),
                    finalize(() => this.isLoadProductOptionValues.set(false)),
                  );
                }),
              )
          : this._productOptionMpService
              .getPagedProductOptionValuesByProductOptionId(
                this.productOption()?.id!,
                this._queryParams,
              )
              .pipe(
                tap((response) => {
                  if (value === 'reset') {
                    this.changedProductOptionValues = undefined;
                    this.productOptionValues = [];
                    this.currentEditProductOptionValue.set(undefined);
                  }

                  this.productOptionValues.push(...response.data);
                  this.isNextPageProductOptionValues.set(response.isNext);
                }),
                finalize(() => this.isLoadProductOptionValues.set(false)),
              ),
      ),
    ),
  );

  private readonly _loadProductOption = toSignal(
    this._activatedRoute.data.pipe(
      map(({ productOption }) => {
        const data = productOption as ProductOptionMp;
        this.breadcrumbsItems.push({ label: data.name });

        this.productOption.set(data);
        this._loadProductOptionValuesTaskSubject.next();

        return data;
      }),
    ),
  );

  private readonly _updateProductOptionSubject = new Subject<
    UpdateProductVariantOptionMp | UpdateProductDetailOptionMp
  >();

  private readonly _updateProductOptionSubjectTask = toSignal(
    this._updateProductOptionSubject.pipe(
      tap(() => this.isUpdateProductOptionProcess.set(true)),
      switchMap((model) =>
        this._productOptionMpService.update(model).pipe(
          tap((response) => {
            const currentSortType = this.productOption()?.productOptionSortType;

            if (
              this.productOption()?.productOptionType ===
                ProductOptionType.Variant &&
              currentSortType === ProductOptionSortType.Custom &&
              model.productOptionSortType ===
                ProductOptionSortType.Alphabetically
            ) {
              this._toastService.success(
                'The Product Option has been updated.<br />Some changes will be processed in background.',
                undefined,
                true,
              );
            } else {
              this._toastService.success(
                'The Product Option has been updated.',
              );
            }

            this.productOption.set(response.data);

            if (response.data.productOptionSortType !== currentSortType) {
              this._queryParams.pageNumber = 0;
              this.productOptionValues = [];
              this._loadProductOptionValuesTaskSubject.next();
            }

            this.isUpdateProductOptionMode.set(false);
          }),
          catchHttpError(this._toastService),
          finalize(() => this.isUpdateProductOptionProcess.set(false)),
        ),
      ),
    ),
  );

  private readonly _createProductOptionValueSubject = new Subject<
    CreateProductVariantOptionValueMp | CreateProductDetailOptionValueMp
  >();

  private readonly _createProductOptionValueSubjectTask = toSignal(
    this._createProductOptionValueSubject.pipe(
      tap(() => this.isCreateProductOptionValueProcess.set(true)),
      switchMap((model) =>
        this._productOptionValueMpService.create(model).pipe(
          tap((response) => {
            if (
              this.productOption()?.productOptionType ===
                ProductOptionType.Variant &&
              this.productOption()?.productOptionSortType ===
                ProductOptionSortType.Alphabetically
            ) {
              this._toastService.success(
                'The Product Option has been created.<br />Some changes will be processed in background.',
                undefined,
                true,
              );
            } else {
              this._toastService.success(
                'The Product Option has been created.',
              );
            }

            if (
              this.productOption()?.productOptionSortType ===
              ProductOptionSortType.Alphabetically
            ) {
              this._queryParams.pageNumber = 0;
              this._loadProductOptionValuesTaskSubject.next('reset');
              this.currentEditProductOptionValue.set(undefined);

              this.isCreateProductOptionValueMode.set(false);
              return;
            }

            this.productOptionValues.push(response.data);

            this.isCreateProductOptionValueMode.set(false);
          }),
          catchHttpError(this._toastService),
          finalize(() => this.isCreateProductOptionValueProcess.set(false)),
        ),
      ),
    ),
  );

  private readonly _updateProductOptionValueSubject = new Subject<
    UpdateProductVariantOptionValueMp | UpdateProductDetailOptionValueMp
  >();

  private readonly _updateProductOptionValueSubjectTask = toSignal(
    this._updateProductOptionValueSubject.pipe(
      tap(() => this.isUpdateProductOptionValueProcess.set(true)),
      switchMap((model) =>
        this._productOptionValueMpService.update(model).pipe(
          tap((response) => {
            this._toastService.success(
              'The Product Option has been created.<br />Some changes will be processed in background.',
              undefined,
              true,
            );

            if (
              this.productOption()?.productOptionSortType ===
              ProductOptionSortType.Alphabetically
            ) {
              this._queryParams.pageNumber = 0;

              this._loadProductOptionValuesTaskSubject.next('reset');
              return;
            }

            const index = this.productOptionValues.findIndex(
              (x) => x.id === response.data.id,
            );

            if (index > -1) {
              this.productOptionValues[index] = response.data;
            }

            if (this.changedProductOptionValues) {
              const indexInChanged = this.changedProductOptionValues.findIndex(
                (x) => x.id === response.data.id,
              );

              if (indexInChanged > -1) {
                this.changedProductOptionValues[indexInChanged] = response.data;
              }
            }

            this.currentEditProductOptionValue.set(undefined);
          }),
          catchHttpError(this._toastService),
          finalize(() => this.isUpdateProductOptionValueProcess.set(false)),
        ),
      ),
    ),
  );

  private readonly _updatePositionProductOptionValuesSubject = new Subject<
    | UpdatePositionsOfProductDetailOptionValuesMp
    | UpdatePositionsOfProductVariantOptionValuesMp
  >();

  private readonly _updatePositionProductOptionValuesSubjectTask = toSignal(
    this._updatePositionProductOptionValuesSubject.pipe(
      tap(() => this.isUpdatePositionsProductOptionValueProcess.set(true)),
      switchMap((model) =>
        this._productOptionMpService
          .updatePositionsOfProductOptionValues(model)
          .pipe(
            tap(() => {
              if (this.changedProductOptionValues) {
                this.productOptionValues = [...this.changedProductOptionValues];
                this.changedProductOptionValues = undefined;
              }
              if (
                this.productOption()?.productOptionType ===
                ProductOptionType.Variant
              ) {
                this._toastService.success(
                  'Positions of Product Option Values has been updated.<br />Some changes will be processed in background.',
                  undefined,
                  true,
                );
              } else {
                this._toastService.success(
                  'Positions of Product Option Values has been updated.',
                );
              }
            }),
            catchHttpError(this._toastService),
            finalize(() =>
              this.isUpdatePositionsProductOptionValueProcess.set(false),
            ),
          ),
      ),
    ),
  );

  dropProductOptionValue(event: CdkDragDrop<ProductOptionValueMp[]>) {
    if (this.productOptionValues && !this.changedProductOptionValues) {
      this.changedProductOptionValues = [...this.productOptionValues];
    }

    if (this.changedProductOptionValues) {
      moveItemInArray(
        this.changedProductOptionValues,
        event.previousIndex,
        event.currentIndex,
      );

      if (
        JSON.stringify(this.changedProductOptionValues) ===
        JSON.stringify(this.productOptionValues)
      ) {
        this.changedProductOptionValues = undefined;
      }
    }
  }

  onChooseProductOptionValueToEdit(optionValue: ProductOptionValueMp) {
    this.currentEditProductOptionValue.set(optionValue);
    this.updateProductOptionValueFormGroup.reset();
    this.updateProductOptionValueFormGroup.controls.value.setValue(
      optionValue.value,
    );
  }

  updateProductOptionValue() {
    if (!this.updateProductOptionValueFormGroup.valid) {
      return;
    }

    const value = this.updateProductOptionValueFormGroup.controls.value.value;

    const model =
      this.productOption()?.productOptionType === ProductOptionType.Variant
        ? new UpdateProductVariantOptionValueMp(
            this.currentEditProductOptionValue()?.id!,
            value!,
          )
        : new UpdateProductDetailOptionValueMp(
            this.currentEditProductOptionValue()?.id!,
            value!,
          );

    this._updateProductOptionValueSubject.next(model);
  }

  onSavePosition() {
    if (this.changedProductOptionValues) {
      const idPositions: ValuePosition<string>[] = [];

      this.changedProductOptionValues.forEach((item, index) => {
        if (
          this.productOptionValues &&
          this.productOptionValues[index].id !== item.id
        ) {
          idPositions.push({ value: item.id, position: index });
        }
      });

      const model =
        this.productOption()?.productOptionType === ProductOptionType.Variant
          ? new UpdatePositionsOfProductVariantOptionValuesMp(
              this.productOption()?.id!,
              idPositions,
            )
          : new UpdatePositionsOfProductDetailOptionValuesMp(
              this.productOption()?.id!,
              idPositions,
            );

      this._updatePositionProductOptionValuesSubject.next(model);
    }
  }

  onSwapToUpdateProductOption() {
    this.updateProductOptionFormGroup.controls.name.setValue(
      this.productOption()?.name!,
    );
    this.updateProductOptionFormGroup.controls.productOptionSortType.setValue(
      this.productOption()?.productOptionSortType!,
    );
    this.isUpdateProductOptionMode.set(true);
  }

  onSwapToCreateProductOptionValue() {
    this.createProductOptionValueFormGroup.reset();

    this.isCreateProductOptionValueMode.set(true);
  }

  updateProductOption() {
    if (!this.updateProductOptionFormGroup.valid) {
      return;
    }

    const value = this.updateProductOptionFormGroup.value;

    const model =
      this.productOption()?.productOptionType === ProductOptionType.Variant
        ? new UpdateProductVariantOptionMp(
            this.productOption()?.id!,
            value.name!,
            value.productOptionSortType as ProductOptionSortType,
          )
        : new UpdateProductDetailOptionMp(
            this.productOption()?.id!,
            value.name!,
            value.productOptionSortType as ProductOptionSortType,
          );

    this._updateProductOptionSubject.next(model);
  }

  loadMoreValues() {
    this._loadProductOptionValuesTaskSubject.next();
  }

  createProductOptionValue() {
    if (!this.createProductOptionValueFormGroup.valid) {
      return;
    }

    const value = this.createProductOptionValueFormGroup.controls.value.value;

    const model =
      this.productOption()?.productOptionType === ProductOptionType.Variant
        ? new CreateProductVariantOptionValueMp(
            value!,
            this.productOption()?.id!,
          )
        : new CreateProductDetailOptionValueMp(
            value!,
            this.productOption()?.id!,
          );

    this._createProductOptionValueSubject.next(model);
  }

  private readonly _removeProductOptionSubject = new Subject<ProductOptionMp>();

  readonly isProductOptionRemoveProccess = signal(false);

  private readonly _removeProductOptionTask = toSignal(
    this._removeProductOptionSubject.pipe(
      tap(() => this.isProductOptionRemoveProccess.set(true)),
      switchMap((productOption) =>
        this._productOptionMpService.remove(productOption).pipe(
          tap(() => {
            this._router.navigate(['../'], {
              relativeTo: this._activatedRoute,
            });
            this._toastService.success('The Product Option has been removed.');
          }),
          catchHttpError(this._toastService, () =>
            this.isProductOptionRemoveProccess.set(false),
          ),
        ),
      ),
    ),
  );

  removeProductOption() {
    const productOption = this.productOption();

    productOption && this._removeProductOptionSubject.next(productOption);
  }

  private readonly _removeProductOptionValueSubject = new Subject<{
    id: string;
    productOptionType: ProductOptionType;
  }>();

  readonly currentProductOptionValueRemoveProcess = signal<string | undefined>(
    undefined,
  );

  private readonly _removeProductOptionValueTask = toSignal(
    this._removeProductOptionValueSubject.pipe(
      tap((value) => this.currentProductOptionValueRemoveProcess.set(value.id)),
      switchMap((value) =>
        this._productOptionValueMpService
          .remove(value.id, value.productOptionType)
          .pipe(
            tap(() => {
              const index = this.productOptionValues.findIndex(
                (x) => x.id === value.id,
              );

              if (index > -1) {
                this.productOptionValues.splice(index, 1);
              }

              this._toastService.success(
                'The Product Option Value has been removed.',
              );
            }),
            catchHttpError(this._toastService),
            finalize(() =>
              this.currentProductOptionValueRemoveProcess.set(undefined),
            ),
          ),
      ),
    ),
  );

  removeProductOptionValue(id: string) {
    const productOption = this.productOption();

    productOption &&
      this._removeProductOptionValueSubject.next({
        id,
        productOptionType: productOption.productOptionType,
      });
  }
}
