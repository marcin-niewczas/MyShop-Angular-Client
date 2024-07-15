import { Component, Signal, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  CdkDragDrop,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { inAnimation } from '../../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../../../shared/components/photo/photo.component';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import {
  FileWithEncodedContent,
  isFileWithEncodedContent,
} from '../../../../../shared/models/helpers/file-with-encoded-content.class';
import { PhotoFormFileName } from '../../../../../shared/models/helpers/photo-form-file-name.enum';
import { ValuePosition } from '../../../../../shared/models/helpers/value-position.interface';
import { FileSizePipe } from '../../../../../shared/pipes/file-size.pipe';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PhotoMp } from '../../../models/photos/photo-mp.interface';
import { CreateProductVariantPhotoItemsMp } from '../../../models/product-variant/create-product-variant-photo-items-mp.class';
import { ProductVariantPhotoItemMp } from '../../../models/product-variant/product-variant-photo-item-mp.interface';
import { GetPagedProductPhotosByProductIdMpQueryParams } from '../../../models/query-params/get-paged-product-photos-by-product-id-mp-query-params.interface';
import { ProductMpService } from '../../../services/product-mp.service';
import { ProductVariantMpService } from '../../../services/product-variant-mp.service';
import { MpProductVariantPhotosUpdateResolvedData } from './mp-product-variant-photos-update.resolver';
import { MpExistProductPhotoChoserGalleryComponent } from '../mp-exist-product-photo-choser-gallery/mp-exist-product-photo-choser-gallery.component';
import { MpUploadProductVariantPhotoComponent } from '../mp-upload-product-variant-photo/mp-upload-product-variant-photo.component';

@Component({
  selector: 'app-mp-product-variant-photos-update',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    LoadingComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatDividerModule,
    MpUploadProductVariantPhotoComponent,
    MpExistProductPhotoChoserGalleryComponent,
    PhotoComponent,
    FileSizePipe,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './mp-product-variant-photos-update.component.html',
  styleUrl: './mp-product-variant-photos-update.component.scss',
  animations: [inAnimation],
})
export class MpProductVariantPhotosUpdateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _productVariantMpService = inject(ProductVariantMpService);
  private readonly _productMpService = inject(ProductMpService);
  private readonly _toastService = inject(ToastService);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Products', routerLink: '../../../../../' },
  ];

  readonly openedPhotoGallery = signal(false);

  readonly validatorParameters =
    this._productVariantMpService.validatorParameters;

  readonly newPhotosControl = this._formBuilder.control(
    {
      value: null as (FileWithEncodedContent | PhotoMp)[] | null,
      disabled: true,
    },
    Validators.required,
  );

  readonly isFileWithEncodedContent = isFileWithEncodedContent;

  private readonly _setOrRefreshPhotos = new Subject<
    ProductVariantPhotoItemMp[] | undefined
  >();

  readonly photos = toSignal(
    this._setOrRefreshPhotos.pipe(
      switchMap((value) =>
        value == undefined
          ? this._productVariantMpService
              .getProductVariantPhotoItems(this.productVariant()!.id)
              .pipe(
                map((response) => {
                  if (
                    response.data.length >= this.validatorParameters?.maxPhotos!
                  ) {
                    this.newPhotosControl.disable();
                    console.log(this.newPhotosControl.disabled);
                  } else {
                    this.newPhotosControl.enable();
                  }

                  return response.data;
                }),
                finalize(() => {
                  this.isSavePositionProcess.set(false);
                  this.currentRemoveId.set(undefined);
                  this.isSaveChosenOrUploadedPhotosProcess.set(false);
                  this.photosChanged = undefined;
                }),
              )
          : of(value),
      ),
    ),
  );

  photosChanged?: ProductVariantPhotoItemMp[];

  private readonly _getPagedExistingProductPhotosMpQueryParams: GetPagedProductPhotosByProductIdMpQueryParams =
    {
      pageNumber: 0,
      pageSize: 10,
    };

  readonly productVariant = toSignal(
    this._activatedRoute.data.pipe(
      map(({ mpProductVariantPhotosUpdateResolvedData }) => {
        const data =
          mpProductVariantPhotosUpdateResolvedData as MpProductVariantPhotosUpdateResolvedData;

        this.breadcrumbsItems.push({
          label: data.productVariant.productName,
          routerLink: '../../../../',
        });
        this.breadcrumbsItems.push({
          label: `Update Photos of ${data.productVariant.productName} ${data.productVariant.variantLabel}`,
        });

        this._setOrRefreshPhotos.next(data.photos);
        this._getPagedExistingProductPhotosMpQueryParams.expectProductVariantId =
          data.productVariant.id;

        return data.productVariant;
      }),
    ),
  );

  readonly isSavePositionProcess = signal(false);
  readonly currentRemoveId = signal<string | undefined>(undefined);
  readonly isSaveChosenOrUploadedPhotosProcess = signal(false);

  readonly isProcess = computed(
    () =>
      this.isSavePositionProcess() ||
      this.currentRemoveId() != undefined ||
      this.isSaveChosenOrUploadedPhotosProcess(),
  );

  private readonly _isProcessChange = toSignal(
    toObservable(this.isProcess).pipe(
      tap((value) => {
        const photosCount = this.photos()?.length!;
        const newPhotosCount = this.newPhotosControl.value?.length ?? 0;

        if (
          value ||
          photosCount + newPhotosCount >= this.validatorParameters?.maxPhotos!
        ) {
          this.newPhotosControl.disable();
        } else {
          this.newPhotosControl.enable();
        }
      }),
    ),
  );

  private readonly _loadMorePagedProductPhotosSubject = new Subject<
    Signal<PhotoMp[] | undefined> | 'reset'
  >();
  readonly isLoadPagedProductPhotos = signal(false);
  readonly isNextPagedProductPhotos = signal(true);

  readonly existingPhotos = toSignal(
    this._loadMorePagedProductPhotosSubject.pipe(
      tap((value) => {
        if (value === 'reset') {
          this._getPagedExistingProductPhotosMpQueryParams.pageNumber = 1;
        } else {
          this._getPagedExistingProductPhotosMpQueryParams.pageNumber += 1;
        }

        this.isLoadPagedProductPhotos.set(true);
      }),
      switchMap((value) =>
        this._productMpService
          .getPagedProductPhotosByProductId(
            this.productVariant()?.productId!,
            this._getPagedExistingProductPhotosMpQueryParams,
          )
          .pipe(
            map((response) => {
              this.isNextPagedProductPhotos.set(response.isNext);

              if (value !== 'reset') {
                const current = value();

                if (current) {
                  current.push(...response.data);

                  return current;
                }
              }

              return response.data;
            }),
            finalize(() => this.isLoadPagedProductPhotos.set(false)),
          ),
      ),
    ),
  );

  private readonly _removeProductVariantPhotoItemSubject =
    new Subject<string>();

  private readonly _removeProductVariantPhotoItemTask = toSignal(
    this._removeProductVariantPhotoItemSubject.pipe(
      tap((id) => this.currentRemoveId.set(id)),
      switchMap((id) =>
        this._productVariantMpService.removeProductVariantPhotoItems(id).pipe(
          tap(() => {
            this._setOrRefreshPhotos.next(undefined);

            if (this.existingPhotos()) {
              this._loadMorePagedProductPhotosSubject.next('reset');
            }

            this._toastService.success('The Product Photo has been removed.');
          }),
          catchHttpError(this._toastService, () =>
            this.currentRemoveId.set(id),
          ),
        ),
      ),
    ),
  );

  removeProductPhoto(id: string) {
    this._removeProductVariantPhotoItemSubject.next(id);
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
    const value = this.newPhotosControl.value;

    if (value && index < value.length) {
      if (value.length === 1) {
        this.newPhotosControl.setValue(null);
      } else {
        value.splice(index, 1);
        this.newPhotosControl.setValue(value);
      }

      this.newPhotosControl.updateValueAndValidity();
      this.onNewPhotosControlValueChange();
    }
  }

  onSwapIndexInPhotoForm(index: number, direction: 'up' | 'down') {
    const photos = this.newPhotosControl.value;

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

      this.newPhotosControl.setValue(photos);
      this.newPhotosControl.updateValueAndValidity();
    }
  }

  onNewPhotosControlValueChange() {
    const newPhotosControlValueCount = this.newPhotosControl.value?.length ?? 0;
    const currentPhotoCount = this.photos()?.length;

    if (
      newPhotosControlValueCount != undefined &&
      currentPhotoCount != undefined
    ) {
      if (
        this.validatorParameters?.maxPhotos! <=
        newPhotosControlValueCount + currentPhotoCount
      ) {
        this.newPhotosControl.disable();
      } else {
        this.newPhotosControl.enable();
      }
    }
  }

  private readonly _isSavePositionsSubject = new Subject<
    ValuePosition<string>[]
  >();

  private readonly _isSavePositionsTask = toSignal(
    this._isSavePositionsSubject.pipe(
      tap(() => this.isSavePositionProcess.set(true)),
      switchMap((model) =>
        this._productVariantMpService
          .updatePositionsOfProductVariantPhotoItems(
            this.productVariant()?.id!,
            model,
          )
          .pipe(
            tap(() => {
              this._toastService.success(
                'Positions of Product Variant Photos has been updated.',
              );

              this._setOrRefreshPhotos.next(undefined);
            }),
            catchHttpError(this._toastService, () =>
              this.isSavePositionProcess.set(false),
            ),
          ),
      ),
    ),
  );

  drop(event: CdkDragDrop<ProductVariantPhotoItemMp[]>) {
    const photos = this.photos();

    if (photos) {
      if (!this.photosChanged && photos) {
        this.photosChanged = [...photos];
      }

      if (this.photosChanged) {
        moveItemInArray(
          this.photosChanged,
          event.previousIndex,
          event.currentIndex,
        );

        if (JSON.stringify(this.photosChanged) === JSON.stringify(photos)) {
          this.photosChanged = undefined;
        }
      }
    }
  }

  savePositions() {
    const photos = this.photos();
    if (!this.photosChanged || !photos) {
      return;
    }

    const idPositions: ValuePosition<string>[] = [];

    this.photosChanged.forEach((item, index) => {
      if (photos && photos[index].id !== item.id) {
        idPositions.push({ value: item.id, position: index });
      }
    });

    this._isSavePositionsSubject.next(idPositions);
  }

  private readonly _saveChosenOrUploadedPhotosSubject = new Subject<{
    exist: CreateProductVariantPhotoItemsMp | undefined;
    formData: FormData | undefined;
  }>();

  private readonly _saveChosenOrUploadedPhotosTask = toSignal(
    this._saveChosenOrUploadedPhotosSubject.pipe(
      tap(() => this.isSaveChosenOrUploadedPhotosProcess.set(true)),
      switchMap((value) => {
        const tasks: Observable<Object>[] = [];

        if (value.exist) {
          tasks.push(
            this._productVariantMpService.createProductVariantPhotoItems(
              value.exist,
            ),
          );
        }

        if (value.formData) {
          tasks.push(
            this._productVariantMpService.uploadProductVariantPhotos(
              this.productVariant()?.id!,
              value.formData,
            ),
          );
        }

        return forkJoin(tasks).pipe(
          tap(() => {
            this.newPhotosControl.reset();

            this._setOrRefreshPhotos.next(undefined);

            if (this.existingPhotos()) {
              this._loadMorePagedProductPhotosSubject.next('reset');
            }

            this._toastService.success(
              `${tasks.length > 1 ? 'Photos' : 'The Photo'} has been added.`,
            );
          }),
          catchHttpError(this._toastService, () => {
            this.newPhotosControl.reset();
            this._setOrRefreshPhotos.next(undefined);
            this.isSaveChosenOrUploadedPhotosProcess.set(false);

            if (this.existingPhotos()) {
              this._loadMorePagedProductPhotosSubject.next('reset');
            }
          }),
        );
      }),
    ),
  );

  saveChosenOrUploadedPhotos() {
    if (!this.newPhotosControl.value) {
      return;
    }

    const newPhotos = this.newPhotosControl.value;

    if (!newPhotos) {
      return;
    }

    const positionedPhotos = newPhotos.map((item, index) => {
      if (item instanceof FileWithEncodedContent) {
        return {
          position: this.photos()?.length! + index,
          value: item.file,
        } as ValuePosition<File>;
      }

      return {
        position: this.photos()?.length! + index,
        value: item.id,
      } as ValuePosition<string>;
    });

    const fileArray = positionedPhotos.filter(
      (p): p is ValuePosition<File> => p.value instanceof File,
    );

    const existedPhotoIdPositions = positionedPhotos.filter(
      (p): p is ValuePosition<string> => !(p.value instanceof File),
    );

    let exist: CreateProductVariantPhotoItemsMp | undefined;

    if (existedPhotoIdPositions.length > 0) {
      exist = new CreateProductVariantPhotoItemsMp(
        this.productVariant()?.id!,
        existedPhotoIdPositions,
      );
    }

    let formData: FormData | undefined = undefined;

    if (fileArray.length > 0) {
      formData = new FormData();

      formData.append('id', this.productVariant()?.id!);

      fileArray.forEach((i) =>
        formData?.append(
          PhotoFormFileName.ProductVariantPhotos,
          i.value,
          `${i.position.toString()}.${i.value.name.split('.').pop()}`,
        ),
      );
    }

    this._saveChosenOrUploadedPhotosSubject.next({ exist, formData });
  }
}
