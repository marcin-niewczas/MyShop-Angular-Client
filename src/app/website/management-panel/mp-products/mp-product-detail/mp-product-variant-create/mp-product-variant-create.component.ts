import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { NgOptimizedImage, CurrencyPipe, NgClass } from '@angular/common';
import { Component, Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import {
  EMPTY,
  Observable,
  Subject,
  finalize,
  forkJoin,
  map,
  mergeMap,
  switchMap,
  tap,
} from 'rxjs';
import { inAnimation } from '../../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../../../shared/components/photo/photo.component';
import { CheckMaxHeightDirective } from '../../../../../shared/directives/check-max-height.directive';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import {
  isFileWithEncodedContent,
  FileWithEncodedContent,
} from '../../../../../shared/models/helpers/file-with-encoded-content.class';
import { PhotoFormFileName } from '../../../../../shared/models/helpers/photo-form-file-name.enum';
import { ValuePosition } from '../../../../../shared/models/helpers/value-position.interface';
import { ApiPagedResponse } from '../../../../../shared/models/responses/api-paged-response.interface';
import { FileSizePipe } from '../../../../../shared/pipes/file-size.pipe';
import { BreakpointObserverService } from '../../../../../shared/services/breakpoint-observer.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../../shared/validators/custom-validator';
import { PhotoMp } from '../../../models/photos/photo-mp.interface';
import { ProductOptionValueMp } from '../../../models/product-option-value/product-option-value-mp.interface';
import { ProductVariantOptionOfProductMp } from '../../../models/product-option/variants/product-variant-option-of-product-mp.interface';
import { CreateProductVariantMp } from '../../../models/product-variant/create-product-variant-mp.class';
import { ProductMp } from '../../../models/product/product-mp.interface';
import { GetPagedProductOptionValuesByProductOptionIdMpQueryParams } from '../../../models/query-params/get-paged-product-option-values-by-product-option-id-mp-query-params.interface';
import { GetPagedProductPhotosByProductIdMpQueryParams } from '../../../models/query-params/get-paged-product-photos-by-product-id-mp-query-params.interface';
import { ProductMpService } from '../../../services/product-mp.service';
import { ProductOptionMpService } from '../../../services/product-option-mp.service';
import { ProductVariantMpService } from '../../../services/product-variant-mp.service';
import { MpExistProductPhotoChoserGalleryComponent } from '../mp-exist-product-photo-choser-gallery/mp-exist-product-photo-choser-gallery.component';
import { MpUploadProductVariantPhotoComponent } from '../mp-upload-product-variant-photo/mp-upload-product-variant-photo.component';

type ProductVariantOptionFormGroup = {
  productVariantOption: FormControl<ProductVariantOptionOfProductMp | null>;
  productVariantOptionValue: FormControl<ProductOptionValueMp | null>;
  pageNumber: FormControl<number | null>;
  isLoad: FormControl<boolean | null>;
  isNext: FormControl<boolean | null>;
  productOptionValues: FormControl<ProductOptionValueMp[] | null>;
};

@Component({
  selector: 'app-mp-product-variant-create',
  standalone: true,
  imports: [
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbsComponent,
    InfiniteScrollDirective,
    CheckMaxHeightDirective,
    LoadingComponent,
    MatRippleModule,
    RouterLink,
    MatDividerModule,
    MpUploadProductVariantPhotoComponent,
    MpExistProductPhotoChoserGalleryComponent,
    FileSizePipe,
    NgOptimizedImage,
    CurrencyPipe,
    PhotoComponent,
    NgClass,
  ],
  templateUrl: './mp-product-variant-create.component.html',
  styleUrl: './mp-product-variant-create.component.scss',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  animations: [inAnimation],
})
export class MpProductVariantCreateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _breakpointObserverService = inject(
    BreakpointObserverService,
  );
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _productMpService = inject(ProductMpService);
  private readonly _productOptionMpService = inject(ProductOptionMpService);
  private readonly _productVariantMpService = inject(ProductVariantMpService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  readonly openedPhotoGallery = signal(false);

  get validatorParameters() {
    return this._productVariantMpService.validatorParameters;
  }

  readonly isSmallScreen = this._breakpointObserverService.isSmallScreen;
  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Products', routerLink: '../../../' },
  ];

  readonly productVariantOptionsFormGroup = this._formBuilder.group({
    productVariantOptionsFormArray: this._formBuilder.array(
      [] as FormGroup<ProductVariantOptionFormGroup>[],
    ),
  });

  readonly isFileWithEncodedContent = isFileWithEncodedContent;

  readonly priceAndQuantityFormGroup = this._formBuilder.group({
    quantity: this._formBuilder.control(
      null as number | null,
      CustomValidators.mapValidators(
        this.validatorParameters?.productVariantQuantityParams!,
      ),
    ),
    price: this._formBuilder.control(
      null as number | null,
      CustomValidators.mapValidators(this.validatorParameters?.priceParams!),
    ),
  });

  readonly photosFormGroup = this._formBuilder.group({
    photos: this._formBuilder.control(
      null as (FileWithEncodedContent | PhotoMp)[] | null,
      Validators.required,
    ),
  });

  private readonly _pageSize = 10;

  private readonly _getPagedProductOptionValuesByProductOptionIdMpQueryParams: GetPagedProductOptionValuesByProductOptionIdMpQueryParams =
    {
      pageNumber: 1,
      pageSize: this._pageSize,
    };

  private readonly _getPagedExistingProductPhotosMpQueryParams: GetPagedProductPhotosByProductIdMpQueryParams =
    {
      pageNumber: 0,
      pageSize: this._pageSize,
    };

  private readonly _loadMorePagedProductVariantOptionValuesSubject =
    new Subject<FormGroup<ProductVariantOptionFormGroup>>();

  private readonly _loadMoreProductVariantOptionValuesTask = toSignal(
    this._loadMorePagedProductVariantOptionValuesSubject.pipe(
      tap((formGroup) => {
        formGroup.controls.isLoad.setValue(true);
        formGroup.controls.pageNumber.setValue(
          formGroup.controls.pageNumber.value! + 1,
        );
      }),
      mergeMap((formGroup) =>
        this._productOptionMpService
          .getPagedProductOptionValuesByProductOptionId(
            formGroup.controls.productVariantOption.value?.productOptionId!,
            {
              pageNumber: formGroup.controls.pageNumber.value!,
              pageSize: this._pageSize,
            },
          )
          .pipe(
            tap((response) => {
              formGroup.controls.isNext.setValue(response.isNext);
              const currentValue =
                formGroup.controls.productOptionValues.value!;

              if (currentValue) {
                currentValue.push(...response.data);
                return;
              }
              formGroup.controls.productOptionValues.setValue(response.data);
            }),
            finalize(() => formGroup.controls.isLoad.setValue(false)),
          ),
      ),
    ),
  );

  private readonly _loadMorePagedProductVariantOptionsSubject =
    new Subject<string>();

  private readonly _loadMorePagedProductVariantOptionsTask = toSignal(
    this._loadMorePagedProductVariantOptionsSubject.pipe(
      switchMap((id) =>
        this._productMpService
          .getPagedProductVariantOptionsByProductId(
            id,
            this._getPagedProductOptionValuesByProductOptionIdMpQueryParams,
          )
          .pipe(
            switchMap((response) => {
              if (response.isNext) {
                const taskList = [] as Observable<
                  ApiPagedResponse<ProductVariantOptionOfProductMp>
                >[];
                for (let i = 2; i <= response.totalPages; i++) {
                  this._getPagedProductOptionValuesByProductOptionIdMpQueryParams.pageNumber =
                    i;
                  taskList.push(
                    this._productMpService.getPagedProductVariantOptionsByProductId(
                      id,
                      this
                        ._getPagedProductOptionValuesByProductOptionIdMpQueryParams,
                    ),
                  );
                }

                return forkJoin(taskList).pipe(
                  map((taskResponses) => {
                    response.data.push(...taskResponses.flatMap((x) => x.data));

                    response.data.forEach((option) => {
                      const formGroup =
                        this.createProductVariantOptionsFormGroup(option);
                      this.productVariantOptionsFormGroup.controls.productVariantOptionsFormArray.push(
                        formGroup,
                      );

                      this._loadMorePagedProductVariantOptionValuesSubject.next(
                        formGroup,
                      );
                    });

                    return;
                  }),
                );
              }

              response.data.forEach((option) => {
                const formGroup =
                  this.createProductVariantOptionsFormGroup(option);
                this.productVariantOptionsFormGroup.controls.productVariantOptionsFormArray.push(
                  formGroup,
                );

                this._loadMorePagedProductVariantOptionValuesSubject.next(
                  formGroup,
                );
              });

              return EMPTY;
            }),
          ),
      ),
    ),
  );

  readonly product = toSignal(
    this._activatedRoute.data.pipe(
      map(({ product }) => {
        const data = product as ProductMp;
        this.breadcrumbsItems.push({
          label: data.fullName,
          routerLink: '../../',
        });
        this.breadcrumbsItems.push({ label: 'Create Product Variant' });

        this._loadMorePagedProductVariantOptionsSubject.next(data.id);
        return data;
      }),
    ),
  );

  private readonly _loadMorePagedProductPhotosSubject = new Subject<
    Signal<PhotoMp[] | undefined>
  >();
  readonly isLoadPagedProductPhotos = signal(false);
  readonly isNextPagedProductPhotos = signal(true);

  readonly existingPhotos = toSignal(
    this._loadMorePagedProductPhotosSubject.pipe(
      tap(() => {
        this._getPagedExistingProductPhotosMpQueryParams.pageNumber += 1;
        this.isLoadPagedProductPhotos.set(true);
      }),
      switchMap((productPhotosSig) =>
        this._productMpService
          .getPagedProductPhotosByProductId(
            this.product()?.id!,
            this._getPagedExistingProductPhotosMpQueryParams,
          )
          .pipe(
            map((response) => {
              this.isNextPagedProductPhotos.set(response.isNext);

              const current = productPhotosSig();

              if (current) {
                current.push(...response.data);

                return current;
              }

              return response.data;
            }),
            finalize(() => this.isLoadPagedProductPhotos.set(false)),
          ),
      ),
    ),
  );

  private readonly _createProductVariantSubject = new Subject<{
    model: CreateProductVariantMp;
    formData: FormData | undefined;
  }>();
  readonly isCreateProcess = signal(false);

  private readonly _createProductVariantTask = toSignal(
    this._createProductVariantSubject.pipe(
      tap(() => {
        this.isCreateProcess.set(true);
      }),
      switchMap((data) =>
        this._productMpService.createProductVariant(data.model).pipe(
          switchMap((response) => {
            if (data.formData) {
              return this._productVariantMpService
                .uploadProductVariantPhotos(response.id, data.formData)
                .pipe(
                  tap(() => {
                    this._router.navigate(['../../'], {
                      relativeTo: this._activatedRoute,
                    });
                    this._toastService.success(
                      'The Product Variant has been created.',
                    );
                  }),
                  catchHttpError(this._toastService),
                );
            }

            this._router.navigate(['../../'], {
              relativeTo: this._activatedRoute,
            });
            this._toastService.success('The Product Variant has been created.');

            return EMPTY;
          }),
          catchHttpError(this._toastService, () =>
            this.isCreateProcess.set(false),
          ),
        ),
      ),
    ),
  );

  private createProductVariantOptionsFormGroup(
    option: ProductVariantOptionOfProductMp,
  ) {
    return this._formBuilder.group({
      productVariantOption: this._formBuilder.control(option, [
        Validators.required,
      ]),
      productVariantOptionValue: this._formBuilder.control(
        null as ProductOptionValueMp | null,
        [Validators.required],
      ),
      pageNumber: this._formBuilder.control(0, [Validators.required]),
      isLoad: this._formBuilder.control(true, [Validators.required]),
      isNext: this._formBuilder.control(true, [Validators.required]),
      productOptionValues: this._formBuilder.control(
        null as ProductOptionValueMp[] | null,
        [Validators.required],
      ),
    });
  }

  loadMorePagedProductVariantOptionValue(
    formGroup: FormGroup<ProductVariantOptionFormGroup>,
  ) {
    this._loadMorePagedProductVariantOptionValuesSubject.next(formGroup);
  }

  markFormGroupAsTouched(formGroup: FormGroup) {
    formGroup.markAllAsTouched();
  }

  openExistPhotosGallery() {
    if (!this.existingPhotos() && !this.isLoadPagedProductPhotos()) {
      this._loadMorePagedProductPhotosSubject.next(this.existingPhotos);
    }

    this.openedPhotoGallery.set(true);
  }

  loadMorePagedProductPhotos() {
    this._loadMorePagedProductPhotosSubject.next(this.existingPhotos);
  }

  removeAttachedOrChosenProductPhoto(index: number) {
    const value = this.photosFormGroup.controls.photos.value;

    if (value && index < value.length) {
      if (value.length === 1) {
        this.photosFormGroup.controls.photos.setValue(null);
      } else {
        value.splice(index, 1);
        this.photosFormGroup.controls.photos.setValue(value);
      }

      this.photosFormGroup.controls.photos.updateValueAndValidity();
    }
  }

  createProductVariant() {
    if (
      !this.productVariantOptionsFormGroup.valid ||
      !this.priceAndQuantityFormGroup.valid ||
      !this.photosFormGroup.valid
    ) {
      return;
    }
    const priceAndQuantityFormValue = this.priceAndQuantityFormGroup.value;
    const productVariantOptionsFormValue =
      this.productVariantOptionsFormGroup.controls
        .productVariantOptionsFormArray.value;
    const productVariantOptionValueIds = productVariantOptionsFormValue.flatMap(
      (i) => i.productVariantOptionValue?.id,
    ) as string[];

    const photos = this.photosFormGroup.controls.photos.value;

    if (!photos) {
      return;
    }

    const positionedPhotos = photos.map((item, index) => {
      if (item instanceof FileWithEncodedContent) {
        return { position: index, value: item.file } as ValuePosition<File>;
      }

      return { position: index, value: item.id } as ValuePosition<string>;
    });

    const fileArray = positionedPhotos.filter(
      (p): p is ValuePosition<File> => p.value instanceof File,
    );

    const existedPhotoIdPositions = positionedPhotos.filter(
      (p): p is ValuePosition<string> => !(p.value instanceof File),
    );

    let formData: FormData | undefined = undefined;

    if (fileArray.length > 0) {
      formData = new FormData();

      formData.append('id', this.product()?.id!);

      fileArray.forEach((i) =>
        formData?.append(
          PhotoFormFileName.ProductVariantPhotos,
          i.value,
          `${i.position.toString()}.${i.value.name.split('.').pop()}`,
        ),
      );
    }

    const productVariantCreateModel = new CreateProductVariantMp(
      priceAndQuantityFormValue.quantity!,
      priceAndQuantityFormValue.price!,
      this.product()?.id!,
      productVariantOptionValueIds,
      existedPhotoIdPositions,
    );

    this._createProductVariantSubject.next({
      model: productVariantCreateModel,
      formData: formData,
    });
  }

  onSwapIndexInPhotoForm(index: number, direction: 'up' | 'down') {
    const photos = this.photosFormGroup.controls.photos.value;

    if (photos && photos.length - 1 >= index) {
      switch (direction) {
        case 'up': {
          const temp = photos[index - 1];
          photos[index - 1] = photos[index];
          photos[index] = temp;
          break;
        }
        case 'down': {
          const temp = photos[index + 1];
          photos[index + 1] = photos[index];
          photos[index] = temp;
          break;
        }
      }

      this.photosFormGroup.controls.photos.setValue(photos);
      this.photosFormGroup.controls.photos.updateValueAndValidity();
    }
  }
}
