import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { DisplayProductType } from '../../../../shared/models/product/display-product-type.enum';
import { NgClass, ViewportScroller } from '@angular/common';
import { CategoryMpService } from '../../services/category-mp.service';
import { GetPagedCategoriesMpQueryParams } from '../../models/query-params/get-paged-categories-mp-query-params.interface';
import {
  BehaviorSubject,
  Subject,
  finalize,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryMp } from '../../models/category/category-mp.interface';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GetPagedProductCategoriesByCategoryRootIdMpQueryParams } from '../../models/query-params/get-paged-product-categories-by-root-id-mp-query-params.interface';
import { ProductOptionMp } from '../../models/product-option/product-option-mp.interface';
import { ProductOptionMpService } from '../../services/product-option-mp.service';
import { GetPagedProductOptionsMpQueryParams } from '../../models/query-params/get-paged-product-options-mp-query-params.interface';
import { ProductOptionTypeMpQueryType } from '../../models/query-types/product-option-type-mp-query-type.enum';
import { ProductOptionsSubtypeMpQueryType } from '../../models/query-types/product-options-mp-query-type.enum';
import { MatRippleModule } from '@angular/material/core';
import { ProductOptionValueMp } from '../../models/product-option-value/product-option-value-mp.interface';
import { GetPagedProductOptionValuesByProductOptionIdMpQueryParams } from '../../models/query-params/get-paged-product-option-values-by-product-option-id-mp-query-params.interface';
import {
  STEPPER_GLOBAL_OPTIONS,
  StepperSelectionEvent,
} from '@angular/cdk/stepper';
import { ProductMpService } from '../../services/product-mp.service';
import { CreateProductMp } from '../../models/product/create-product-mp.class';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { inAnimation } from '../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { CheckMaxHeightDirective } from '../../../../shared/directives/check-max-height.directive';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ValuePosition } from '../../../../shared/models/helpers/value-position.interface';
import { GetPagedCategoriesQueryParam } from '../../../../shared/models/requests/query-models/category/get-paged-categories-query-param.enum';
import { BreakpointObserverService } from '../../../../shared/services/breakpoint-observer.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../shared/validators/custom-validator';

type AdditionalProductDetailOptionFormGroup = {
  additionalProductDetailOption: FormControl<
    ProductOptionMp | null | undefined
  >;
  additionalProductDetailOptionValue: FormControl<
    ProductOptionValueMp | null | undefined
  >;
  pageNumber: FormControl<number | undefined | null>;
  isLoad: FormControl<boolean | undefined | null>;
  isNext: FormControl<boolean | undefined | null>;
  productOptionValues: FormControl<ProductOptionValueMp[] | undefined | null>;
};

@Component({
  selector: 'app-mp-product-create',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatStepperModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    InfiniteScrollDirective,
    FormsModule,
    ReactiveFormsModule,
    CheckMaxHeightDirective,
    MatIconModule,
    RouterLink,
    LoadingComponent,
    MatRippleModule,
    NgClass,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  templateUrl: './mp-product-create.component.html',
  styleUrl: './mp-product-create.component.scss',
  animations: [inAnimation],
})
export class MpProductCreateComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _categoryMpService = inject(CategoryMpService);
  private readonly _productOptionMpService = inject(ProductOptionMpService);
  private readonly _viewportScroller = inject(ViewportScroller);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _productMpService = inject(ProductMpService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _toastService = inject(ToastService);

  readonly DisplayProductPer = DisplayProductType;

  private readonly _pageSize = 10;

  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;
  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Products', routerLink: '../' },
    { label: 'Create Product' },
  ];

  get validatorParameters() {
    return this._productMpService.validatorParameters;
  }

  readonly productAndCategoryFormGroup = this._formBuilder.group({
    rootCategory: this._formBuilder.control(
      undefined as CategoryMp | undefined,
      Validators.required,
    ),
    displayProductPer: this._formBuilder.control(
      null as DisplayProductType | null,
      Validators.required,
    ),
    productCategory: this._formBuilder.control(
      undefined as CategoryMp | undefined,
      Validators.required,
    ),
    modelName: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.modelNameParams!,
      ),
    ),
    description: this._formBuilder.control(
      null as string | null,
      CustomValidators.mapValidators(
        this.validatorParameters?.productDescriptionParams!,
      ),
    ),
  });

  readonly productDetailOptionsFormGroup = this._formBuilder.group({
    mainProductDetailOption: this._formBuilder.control(
      undefined as ProductOptionMp | undefined,
      Validators.required,
    ),
    mainProductDetailOptionValue: this._formBuilder.control(
      undefined as ProductOptionValueMp | undefined,
      Validators.required,
    ),
    additionalProductDetailOptions: this._formBuilder.array(
      [] as FormGroup<AdditionalProductDetailOptionFormGroup>[],
    ),
  });

  readonly productVariantOptionsFormGroup = this._formBuilder.group({
    mainProductVariantOption: this._formBuilder.control(
      undefined as ProductOptionMp | undefined,
      Validators.required,
    ),
    additionalProductVariantOptions: this._formBuilder.array(
      [] as FormGroup<{
        additionalProductVariantOption: FormControl<
          ProductOptionMp | null | undefined
        >;
      }>[],
    ),
  });

  private readonly _getPagedCategoriesMpQueryParams: GetPagedCategoriesMpQueryParams =
    {
      pageNumber: 0,
      pageSize: this._pageSize,
      queryType: GetPagedCategoriesQueryParam.Root,
    };

  private readonly _getPagedProductCategoriesByCategoryRootIdMpQueryParams: GetPagedProductCategoriesByCategoryRootIdMpQueryParams =
    {
      pageNumber: 0,
      pageSize: this._pageSize,
    };

  private readonly _getPagedMainProductDetailOptionsQueryParams: GetPagedProductOptionsMpQueryParams =
    {
      pageNumber: 0,
      pageSize: this._pageSize,
      queryType: ProductOptionTypeMpQueryType.Detail,
      subqueryType: ProductOptionsSubtypeMpQueryType.Main,
    };

  private readonly _getPagedMainProductDetailOptionQueryParams: GetPagedProductOptionValuesByProductOptionIdMpQueryParams =
    {
      pageNumber: 0,
      pageSize: this._pageSize,
    };

  private readonly _getPagedAdditionalProductDetailOptionsQueryParams: GetPagedProductOptionsMpQueryParams =
    {
      pageNumber: 0,
      pageSize: this._pageSize,
      queryType: ProductOptionTypeMpQueryType.Detail,
      subqueryType: ProductOptionsSubtypeMpQueryType.Additional,
    };

  private readonly _getPagedMainProductVariantOptionsQueryParams: GetPagedProductOptionsMpQueryParams =
    {
      pageNumber: 0,
      pageSize: this._pageSize,
      queryType: ProductOptionTypeMpQueryType.Variant,
      subqueryType: ProductOptionsSubtypeMpQueryType.Main,
    };

  private readonly _getPagedAdditionalProductVariantOptionsQueryParams: GetPagedProductOptionsMpQueryParams =
    {
      pageNumber: 0,
      pageSize: this._pageSize,
      queryType: ProductOptionTypeMpQueryType.Variant,
      subqueryType: ProductOptionsSubtypeMpQueryType.Additional,
    };

  get isCategoryFormWarn() {
    return (
      this.productAndCategoryFormGroup.controls.productCategory.touched &&
      !this.productAndCategoryFormGroup.controls.productCategory.valid
    );
  }

  get isMainProductDetailOptionValueFormWarn() {
    return (
      this.productDetailOptionsFormGroup.touched &&
      !this.productDetailOptionsFormGroup.controls.mainProductDetailOptionValue
        .valid
    );
  }

  isAdditionalProductDetailOptionValueFormWarn(
    additionalOptionFormGroup: FormGroup<AdditionalProductDetailOptionFormGroup>,
  ) {
    return (
      (additionalOptionFormGroup.controls.additionalProductDetailOption
        .touched &&
        !additionalOptionFormGroup.controls.additionalProductDetailOption
          .valid) ||
      (additionalOptionFormGroup.controls.additionalProductDetailOptionValue
        .touched &&
        !additionalOptionFormGroup.controls.additionalProductDetailOptionValue
          .valid)
    );
  }

  get isMainProductVariantOptionFormWarn() {
    return (
      this.productVariantOptionsFormGroup.controls.mainProductVariantOption
        .touched &&
      !this.productVariantOptionsFormGroup.controls.mainProductVariantOption
        .valid
    );
  }

  isAdditionalProductVariantOptionFormWarn(
    additionalOptionFormGroup: FormGroup<{
      additionalProductVariantOption: FormControl<
        ProductOptionMp | null | undefined
      >;
    }>,
  ) {
    return (
      additionalOptionFormGroup.controls.additionalProductVariantOption
        .touched &&
      !additionalOptionFormGroup.controls.additionalProductVariantOption.valid
    );
  }

  readonly rootCategories = signal<CategoryMp[] | undefined>(undefined);
  readonly isNextPagedRootCategories = signal(true);
  readonly isLoadPagedRootCategories = signal(false);

  private readonly _loadPagedRootCategoriesSubject = new BehaviorSubject<void>(
    undefined,
  );

  private readonly _loadPagedRootCategoriesTask = toSignal(
    this._loadPagedRootCategoriesSubject.pipe(
      tap(() => {
        this.isLoadPagedRootCategories.set(true);
        this._getPagedCategoriesMpQueryParams.pageNumber += 1;
      }),
      switchMap(() =>
        this._categoryMpService
          .getPagedData(this._getPagedCategoriesMpQueryParams)
          .pipe(
            tap((response) => {
              this.isNextPagedRootCategories.set(response.isNext);

              this.rootCategories.update((current) => {
                if (current) {
                  current.push(...response.data);
                  return current;
                }

                return response.data;
              });
            }),
            finalize(() => this.isLoadPagedRootCategories.set(false)),
          ),
      ),
    ),
  );

  readonly productCategories = signal<CategoryMp[] | undefined>(undefined);
  readonly isNextPagedProductCategories = signal(true);
  readonly isLoadPagedProductCategories = signal(false);

  private readonly _loadPagedProductCategoriesSubject = new Subject<string>();

  private readonly _loadPagedProductCategoriesTask = toSignal(
    this._loadPagedProductCategoriesSubject.pipe(
      tap(() => {
        this.isLoadPagedProductCategories.set(true);
        this._getPagedProductCategoriesByCategoryRootIdMpQueryParams.pageNumber += 1;
      }),
      switchMap((id) =>
        this._categoryMpService
          .getPagedProductCategoriesByCategoryRootId(
            id,
            this._getPagedProductCategoriesByCategoryRootIdMpQueryParams,
          )
          .pipe(
            tap((response) => {
              this.isNextPagedProductCategories.set(response.isNext);

              this.productCategories.update((current) => {
                if (current) {
                  current.push(...response.data);
                  return current;
                }

                return response.data;
              });
            }),
            finalize(() => this.isLoadPagedProductCategories.set(false)),
          ),
      ),
    ),
  );

  readonly mainProductDetailOptions = signal<ProductOptionMp[] | undefined>(
    undefined,
  );
  readonly isNextPagedMainProductDetailOptions = signal(true);
  readonly isLoadPagedMainProductDetailOptions = signal(false);

  private readonly _loadPagedMainProductDetailOptionsSubject =
    new Subject<void>();

  private readonly _loadPagedMainProductDetailOptionsTask = toSignal(
    this._loadPagedMainProductDetailOptionsSubject.pipe(
      tap(() => {
        this.isLoadPagedMainProductDetailOptions.set(true);
        this._getPagedMainProductDetailOptionsQueryParams.pageNumber += 1;
      }),
      switchMap(() =>
        this._productOptionMpService
          .getPagedData(this._getPagedMainProductDetailOptionsQueryParams)
          .pipe(
            tap((response) => {
              this.isNextPagedMainProductDetailOptions.set(response.isNext);

              this.mainProductDetailOptions.update((current) => {
                if (current) {
                  current.push(...response.data);
                  return current;
                }

                return response.data;
              });
            }),
            finalize(() => this.isLoadPagedMainProductDetailOptions.set(false)),
          ),
      ),
    ),
  );

  readonly mainProductDetailOptionValues = signal<
    ProductOptionValueMp[] | undefined
  >(undefined);
  readonly isNextPagedMainProductDetailOptionValues = signal(true);
  readonly isLoadPagedMainProductDetailOptionValues = signal(false);

  private readonly _loadPagedMainProductDetailOptionValuesSubject =
    new Subject<string>();

  private readonly _loadPagedMainProductDetailOptionValuesTask = toSignal(
    this._loadPagedMainProductDetailOptionValuesSubject.pipe(
      tap(() => {
        this.isLoadPagedMainProductDetailOptionValues.set(true);
        this._getPagedMainProductDetailOptionQueryParams.pageNumber += 1;
      }),
      switchMap((id) =>
        this._productOptionMpService
          .getPagedProductOptionValuesByProductOptionId(
            id,
            this._getPagedMainProductDetailOptionQueryParams,
          )
          .pipe(
            tap((response) => {
              this.isNextPagedMainProductDetailOptionValues.set(
                response.isNext,
              );

              this.mainProductDetailOptionValues.update((current) => {
                if (current) {
                  current.push(...response.data);
                  return current;
                }

                return response.data;
              });
            }),
            finalize(() =>
              this.isLoadPagedMainProductDetailOptionValues.set(false),
            ),
          ),
      ),
    ),
  );

  readonly additionalProductDetailOptions = signal<
    ProductOptionMp[] | undefined
  >(undefined);
  readonly isNextPagedAdditionalProductDetailOptions = signal(true);
  readonly isLoadPagedAdditionalProductDetailOptions = signal(false);
  readonly additionalProductDetailOptionCount = signal<number | undefined>(
    undefined,
  );

  private readonly _loadPagedAdditonalProductDetailOptionsSubject =
    new Subject<void>();

  private readonly _loadPagedAdditonalProductDetailOptionsTask = toSignal(
    this._loadPagedAdditonalProductDetailOptionsSubject.pipe(
      tap(() => {
        this.isLoadPagedAdditionalProductDetailOptions.set(true);
        this._getPagedAdditionalProductDetailOptionsQueryParams.pageNumber += 1;
      }),
      switchMap(() =>
        this._productOptionMpService
          .getPagedData(this._getPagedAdditionalProductDetailOptionsQueryParams)
          .pipe(
            tap((response) => {
              this.isNextPagedAdditionalProductDetailOptions.set(
                response.isNext,
              );

              this.additionalProductDetailOptions.update((current) => {
                if (current) {
                  current.push(...response.data);
                  return current;
                }

                return response.data;
              });

              this.additionalProductDetailOptionCount.set(response.totalCount);
            }),
            finalize(() =>
              this.isLoadPagedAdditionalProductDetailOptions.set(false),
            ),
          ),
      ),
    ),
  );

  readonly additionalProductDetailOptionValues = signal<
    ProductOptionValueMp[] | undefined
  >(undefined);
  readonly isNextPagedAdditionalProductDetailOptionValues = signal(true);
  readonly isLoadPagedAdditionalProductDetailOptionValues = signal(false);

  private readonly _loadPagedAdditionalProductDetailOptionValuesSubject =
    new Subject<FormGroup<AdditionalProductDetailOptionFormGroup>>();

  private readonly _loadPagedAdditionalProductDetailOptionValuesTask = toSignal(
    this._loadPagedAdditionalProductDetailOptionValuesSubject.pipe(
      tap((formGroup) => {
        formGroup.controls.isLoad.setValue(true);
        formGroup.controls.pageNumber.setValue(
          formGroup.controls.pageNumber.value! + 1,
        );
      }),
      mergeMap((formGroup) =>
        this._productOptionMpService
          .getPagedProductOptionValuesByProductOptionId(
            formGroup.controls.additionalProductDetailOption.value?.id!,
            {
              pageSize: this._pageSize,
              pageNumber: formGroup.controls.pageNumber.value!,
            },
          )
          .pipe(
            tap((response) => {
              formGroup.controls.isNext.setValue(response.isNext);

              const optionValues = formGroup.controls.productOptionValues.value;

              if (optionValues) {
                optionValues.push(...response.data);
                formGroup.controls.productOptionValues.setValue(optionValues);
              } else {
                formGroup.controls.productOptionValues.setValue(response.data);
              }
            }),
            finalize(() => formGroup.controls.isLoad.setValue(false)),
          ),
      ),
    ),
  );

  readonly mainProductVariantOptions = signal<ProductOptionMp[] | undefined>(
    undefined,
  );
  readonly isNextPagedMainProductVariantOptions = signal(true);
  readonly isLoadPagedMainProductVariantOptions = signal(false);

  private readonly _loadPagedMainProductVariantOptionsSubject =
    new Subject<void>();

  private readonly _loadPagedMainProductVariantOptionsTask = toSignal(
    this._loadPagedMainProductVariantOptionsSubject.pipe(
      tap(() => {
        this.isLoadPagedMainProductVariantOptions.set(true);
        this._getPagedMainProductVariantOptionsQueryParams.pageNumber += 1;
      }),
      switchMap((id) =>
        this._productOptionMpService
          .getPagedData(this._getPagedMainProductVariantOptionsQueryParams)
          .pipe(
            tap((response) => {
              this.isNextPagedMainProductVariantOptions.set(response.isNext);

              this.mainProductVariantOptions.update((current) => {
                if (current) {
                  current.push(...response.data);
                  return current;
                }

                return response.data;
              });
            }),
            finalize(() =>
              this.isLoadPagedMainProductVariantOptions.set(false),
            ),
          ),
      ),
    ),
  );

  readonly additionalProductVariantOptions = signal<
    ProductOptionMp[] | undefined
  >(undefined);
  readonly isNextPagedAdditionalProductVariantOptions = signal(true);
  readonly isLoadPagedAdditionalProductVariantOptions = signal(false);
  readonly additionalProductVariantOptionCount = signal<number | undefined>(
    undefined,
  );

  private readonly _loadPagedAdditionalProductVariantOptionsSubject =
    new Subject<void>();

  private readonly _loadPagedAdditionalProductVariantOptionsTask = toSignal(
    this._loadPagedAdditionalProductVariantOptionsSubject.pipe(
      tap(() => {
        this.isLoadPagedAdditionalProductVariantOptions.set(true);
        this._getPagedAdditionalProductVariantOptionsQueryParams.pageNumber += 1;
      }),
      switchMap(() =>
        this._productOptionMpService
          .getPagedData(
            this._getPagedAdditionalProductVariantOptionsQueryParams,
          )
          .pipe(
            tap((response) => {
              this.isNextPagedAdditionalProductVariantOptions.set(
                response.isNext,
              );

              this.additionalProductVariantOptions.update((current) => {
                if (current) {
                  current.push(...response.data);
                  return current;
                }

                this.additionalProductVariantOptionCount.set(
                  response.totalCount,
                );

                return response.data;
              });
            }),
            finalize(() =>
              this.isLoadPagedAdditionalProductVariantOptions.set(false),
            ),
          ),
      ),
    ),
  );

  readonly isCreateProcess = signal(false);

  private readonly _createProductSubject = new Subject<CreateProductMp>();
  private readonly _createProductTask = toSignal(
    this._createProductSubject.pipe(
      tap(() => this.isCreateProcess.set(true)),
      switchMap((model) =>
        this._productMpService.create(model).pipe(
          tap((response) => {
            this._toastService.success('Product has been created.');
            this._router.navigate(['../', response.id], {
              relativeTo: this._activatedRoute,
            });
          }),
          catchHttpError(this._toastService, () =>
            this.isCreateProcess.set(false),
          ),
        ),
      ),
    ),
  );

  onSelectedIndexStepper(index: number) {
    if (
      index == 1 &&
      !this.mainProductDetailOptions() &&
      !this.isLoadPagedMainProductDetailOptions()
    ) {
      this._loadPagedMainProductDetailOptionsSubject.next();
    }

    if (
      index == 2 &&
      !this.mainProductVariantOptions() &&
      !this.isLoadPagedMainProductVariantOptions()
    ) {
      this._loadPagedMainProductVariantOptionsSubject.next();

      if (
        !this.additionalProductVariantOptions() &&
        this.productAndCategoryFormGroup.controls.displayProductPer.value ===
          DisplayProductType.MainVariantOption &&
        !this.isLoadPagedAdditionalProductVariantOptions()
      ) {
        this._loadPagedAdditionalProductVariantOptionsSubject.next();
      }
    }
  }

  loadMorePagedRootCategories() {
    this._loadPagedRootCategoriesSubject.next();
  }

  loadMorePagedProductCategories() {
    this._loadPagedProductCategoriesSubject.next(
      this.productAndCategoryFormGroup.controls.rootCategory.value?.id!,
    );
  }

  loadMorePagedMainProductDetails() {
    this._loadPagedMainProductDetailOptionsSubject.next();
  }

  loadMorePagedMainProductDetailValues() {
    this._loadPagedMainProductDetailOptionValuesSubject.next(
      this.productDetailOptionsFormGroup.controls.mainProductDetailOption.value
        ?.id!,
    );
  }

  loadMorePagedAdditionalProductDetail() {
    this._loadPagedAdditonalProductDetailOptionsSubject.next();
  }

  loadMorePagedAdditionalProductDetailValues(
    formGroup: FormGroup<AdditionalProductDetailOptionFormGroup>,
  ) {
    this._loadPagedAdditionalProductDetailOptionValuesSubject.next(formGroup);
  }

  loadMorePagedMainProductVariantOptions() {
    this._loadPagedMainProductVariantOptionsSubject.next();
  }

  loadMorePagedAdditionalProductVariant() {
    this._loadPagedAdditionalProductVariantOptionsSubject.next();
  }

  onRootCategoryChange(category: CategoryMp) {
    this._getPagedProductCategoriesByCategoryRootIdMpQueryParams.pageNumber = 0;
    this.productCategories.set(undefined);
    this._loadPagedProductCategoriesSubject.next(category.id);
  }

  onMainProductDetailOptionChange(productOption: ProductOptionMp) {
    this.productDetailOptionsFormGroup.controls.mainProductDetailOptionValue.reset();
    this._getPagedMainProductDetailOptionQueryParams.pageNumber = 0;
    this.mainProductDetailOptionValues.set(undefined);
    this._loadPagedMainProductDetailOptionValuesSubject.next(productOption.id);
  }

  markFormGroupAsTouched(formGroup: FormGroup) {
    formGroup.markAllAsTouched();
  }

  addAdditionalDetailOptionFormGroup() {
    if (
      this.productDetailOptionsFormGroup.controls.additionalProductDetailOptions
        .length <= 0 &&
      !this.additionalProductDetailOptions() &&
      !this.isLoadPagedAdditionalProductDetailOptions()
    ) {
      this._loadPagedAdditonalProductDetailOptionsSubject.next();
    }

    this.productDetailOptionsFormGroup.controls.additionalProductDetailOptions.push(
      this._formBuilder.group({
        additionalProductDetailOption: this._formBuilder.control(
          undefined as ProductOptionMp | null | undefined,
          [Validators.required],
        ),
        additionalProductDetailOptionValue: this._formBuilder.control(
          undefined as ProductOptionValueMp | null | undefined,
          [Validators.required],
        ),
        pageNumber: this._formBuilder.control(0 as number | undefined, [
          Validators.required,
        ]),
        isLoad: this._formBuilder.control(true as boolean | undefined, [
          Validators.required,
        ]),
        isNext: this._formBuilder.control(true as boolean | undefined, [
          Validators.required,
        ]),
        productOptionValues: this._formBuilder.control(
          undefined as ProductOptionValueMp[] | undefined,
          [Validators.required],
        ),
      }),
    );

    this._changeDetectorRef.detectChanges();
    this._viewportScroller.scrollToPosition([0, document.body.scrollHeight]);
  }

  removeAdditionalDetailOptionFormGroup(index: number) {
    this.productDetailOptionsFormGroup.controls.additionalProductDetailOptions.removeAt(
      index,
    );
  }

  removeAdditionalVariantOptionFormGroup(index: number) {
    this.productVariantOptionsFormGroup.controls.additionalProductVariantOptions.removeAt(
      index,
    );
  }

  onAdditionalProductDetailOptionChange(
    formGroup: FormGroup<AdditionalProductDetailOptionFormGroup>,
  ) {
    this._loadPagedAdditionalProductDetailOptionValuesSubject.next(formGroup);
  }

  onBackProductDetailOptionValues(
    formGroup: FormGroup<AdditionalProductDetailOptionFormGroup>,
  ) {
    formGroup.controls.additionalProductDetailOption.setValue(undefined);
    formGroup.controls.additionalProductDetailOptionValue.setValue(undefined);
    formGroup.controls.productOptionValues.setValue(undefined);
    formGroup.controls.isLoad.setValue(true);
    formGroup.controls.isNext.setValue(true);
    formGroup.controls.pageNumber.setValue(0);
  }

  isAdditionalDetailOptionChosen(productOption: ProductOptionMp) {
    return (
      this.productDetailOptionsFormGroup.controls.additionalProductDetailOptions.value.findIndex(
        (x) => x.additionalProductDetailOption?.id == productOption.id,
      ) !== -1
    );
  }

  isAdditionalVariantOptionChosen(
    productOption: ProductOptionMp,
    indexFormGroup: number,
  ) {
    const index =
      this.productVariantOptionsFormGroup.controls.additionalProductVariantOptions.value.findIndex(
        (x) => x.additionalProductVariantOption?.id == productOption.id,
      );
    return index !== -1 && indexFormGroup !== index;
  }

  resetInteracted(stepperSelectionEvent: StepperSelectionEvent) {
    stepperSelectionEvent.selectedStep.interacted = false;
  }

  addAdditionalVariantOptionFormGroup() {
    if (
      this.productVariantOptionsFormGroup.controls
        .additionalProductVariantOptions.length <= 0
    ) {
      this._loadPagedAdditionalProductVariantOptionsSubject.next();
    }

    this.productVariantOptionsFormGroup.controls.additionalProductVariantOptions.push(
      this._formBuilder.group({
        additionalProductVariantOption: this._formBuilder.control(
          undefined as ProductOptionMp | null | undefined,
          [Validators.required],
        ),
      }),
    );

    this._changeDetectorRef.detectChanges();
    this._viewportScroller.scrollToPosition([0, document.body.scrollHeight]);
  }

  onDisplayProductPerChange(displayProductPer: DisplayProductType) {
    if (
      displayProductPer === DisplayProductType.MainVariantOption &&
      this.productVariantOptionsFormGroup.controls
        .additionalProductVariantOptions.length <= 0
    ) {
      this.productVariantOptionsFormGroup.controls.additionalProductVariantOptions.push(
        this._formBuilder.group({
          additionalProductVariantOption: this._formBuilder.control(
            undefined as ProductOptionMp | null | undefined,
            [Validators.required],
          ),
        }),
      );
    }

    const firstAdditionalFormGroup =
      this.productVariantOptionsFormGroup.controls.additionalProductVariantOptions.at(
        0,
      );

    if (
      displayProductPer === DisplayProductType.AllVariantOptions &&
      this.productVariantOptionsFormGroup.controls
        .additionalProductVariantOptions.length === 1 &&
      !firstAdditionalFormGroup.valid
    ) {
      this.productVariantOptionsFormGroup.controls.additionalProductVariantOptions.removeAt(
        0,
      );
    }
  }

  createProduct() {
    if (
      !this.productAndCategoryFormGroup.valid ||
      !this.productDetailOptionsFormGroup.valid ||
      !this.productVariantOptionsFormGroup.valid
    ) {
      return;
    }

    const productAndCategoryFormValue = this.productAndCategoryFormGroup.value;

    const productDetailOptionFormValue =
      this.productDetailOptionsFormGroup.value;

    const chosenProductDetailOptionValues = [
      {
        value: productDetailOptionFormValue.mainProductDetailOptionValue?.id,
        position: 0,
      } as ValuePosition<string>,
    ].concat(
      productDetailOptionFormValue.additionalProductDetailOptions?.map(
        (i, index) => {
          return {
            value: i.additionalProductDetailOptionValue?.id,
            position: index + 1,
          } as ValuePosition<string>;
        },
      ) as ValuePosition<string>[],
    );

    const productVariantOptionFormValue =
      this.productVariantOptionsFormGroup.value;

    const chosenProductVariantOptions = [
      {
        value: productVariantOptionFormValue.mainProductVariantOption?.id,
        position: 0,
      } as ValuePosition<string>,
    ].concat(
      productVariantOptionFormValue.additionalProductVariantOptions?.map(
        (i, index) => {
          return {
            value: i.additionalProductVariantOption?.id,
            position: index + 1,
          } as ValuePosition<string>;
        },
      ) as ValuePosition<string>[],
    );

    const model = new CreateProductMp(
      productAndCategoryFormValue.modelName!,
      productAndCategoryFormValue.displayProductPer!,
      productAndCategoryFormValue.description,
      productAndCategoryFormValue.productCategory?.id!,
      chosenProductDetailOptionValues!,
      chosenProductVariantOptions!,
    );

    this._createProductSubject.next(model);
  }

  onSwapIndexInFormArray(
    formArray: FormArray,
    index: number,
    direction: 'up' | 'down',
  ) {
    switch (direction) {
      case 'up': {
        const temp = formArray.at(index - 1);
        formArray.setControl(index - 1, formArray.at(index));
        formArray.setControl(index, temp);
        break;
      }
      case 'down': {
        const temp = formArray.at(index + 1);
        formArray.setControl(index + 1, formArray.at(index));
        formArray.setControl(index, temp);
        break;
      }
    }
  }
}
