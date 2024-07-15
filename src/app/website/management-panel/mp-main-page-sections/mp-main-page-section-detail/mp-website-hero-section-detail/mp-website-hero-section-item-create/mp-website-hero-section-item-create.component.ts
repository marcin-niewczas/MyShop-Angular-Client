import { NgClass } from '@angular/common';
import { Component, Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, finalize, map, switchMap, tap } from 'rxjs';
import { inAnimation } from '../../../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../../../shared/components/loading/loading.component';
import { PhotoFileInputComponent } from '../../../../../../shared/components/photo-file-input/photo-file-input.component';
import { PhotoGalleryInputDialogComponent } from '../../../../../../shared/components/photo-gallery-input-dialog/photo-gallery-input-dialog.component';
import { PhotoComponent } from '../../../../../../shared/components/photo/photo.component';
import { catchHttpError } from '../../../../../../shared/helpers/pipe-helpers';
import { PhotoDetail } from '../../../../../../shared/models/helpers/photo-detail.class';
import { PhotoFormFileName } from '../../../../../../shared/models/helpers/photo-form-file-name.enum';
import { PaginationQueryParams } from '../../../../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { FileSizePipe } from '../../../../../../shared/pipes/file-size.pipe';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../../../shared/validators/custom-validator';
import { WebsiteHeroSectionMp } from '../../../../models/main-page-sections/main-page-section-mp.interface';
import { PhotoMp } from '../../../../models/photos/photo-mp.interface';
import { MainPageSectionMpService } from '../../../../services/main-page-section-mp.service';
import { PhotoMpService } from '../../../../services/photo-mp.service';

@Component({
  selector: 'app-mp-website-hero-section-item-create',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    BreadcrumbsComponent,
    LoadingComponent,
    RouterLink,
    MatSelectModule,
    NgClass,
    MatDividerModule,
    PhotoFileInputComponent,
    FileSizePipe,
    PhotoComponent,
    PhotoGalleryInputDialogComponent,
  ],
  templateUrl: './mp-website-hero-section-item-create.component.html',
  styleUrl: './mp-website-hero-section-item-create.component.scss',
  animations: [inAnimation],
})
export class MpWebsiteHeroSectionItemCreateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _mainPageSectionMpService = inject(MainPageSectionMpService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _photoMpService = inject(PhotoMpService);

  allowedPositionArray?: Array<number>;

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Main Page Sections', routerLink: '../../../' },
  ];

  readonly photoDetail = signal<PhotoDetail | undefined>(undefined);

  readonly openedPhotoGallery = signal(false);

  private readonly _getPagedWebsiteHeroSectionPhotosQueryParams: PaginationQueryParams =
    {
      pageNumber: 0,
      pageSize: 10,
    };

  readonly formGroup = this._formBuilder.group({
    title: this._formBuilder.control(
      null as string | null,
      CustomValidators.mapValidators(
        this._mainPageSectionMpService.websiteHeroSectionItemValidatorParameters
          ?.titleParams!,
      ),
    ),
    subtitle: this._formBuilder.control(
      null as string | null,
      CustomValidators.mapValidators(
        this._mainPageSectionMpService.websiteHeroSectionItemValidatorParameters
          ?.subtitleParams!,
      ),
    ),
    routerLink: this._formBuilder.control(
      null as string | null,
      CustomValidators.mapValidators(
        this._mainPageSectionMpService.websiteHeroSectionItemValidatorParameters
          ?.routerLinkParams!,
      ),
    ),

    photo: this._formBuilder.group({
      existingPhoto: this._formBuilder.control(
        null as PhotoMp | null,
        Validators.required,
      ),

      photoFile: this._formBuilder.control(
        null as File | null,
        Validators.required,
      ),
    }),

    position: this._formBuilder.control(
      null as number | 'inactive' | null,
      Validators.required,
    ),
  });

  get validatorParameters() {
    return this._mainPageSectionMpService
      .websiteHeroSectionItemValidatorParameters;
  }

  readonly isCreateProcess = signal(false);

  readonly websiteHeroSection = toSignal(
    this._activatedRoute.data.pipe(
      map(({ websiteHeroSection }) => {
        const data = websiteHeroSection as WebsiteHeroSectionMp;

        this.breadcrumbsItems.push(
          ...[
            {
              label: `${data.label} - ${data.mainPageSectionType}`,
              routerLink: ['../../', 'details'],
            },
            { label: 'Create Item' },
          ],
        );

        const maxPosition =
          this._mainPageSectionMpService
            .websiteHeroSectionItemValidatorParameters?.maxPosition!;
        const maxItems =
          this._mainPageSectionMpService
            .websiteHeroSectionItemValidatorParameters
            ?.maxItemsInWebsiteHeroSection!;

        if (maxPosition >= maxItems) {
          this.formGroup.controls.position.setValue('inactive');
          this.formGroup.controls.position.disable();
        } else {
          this.allowedPositionArray = Array(maxPosition);
        }

        return data;
      }),
    ),
  );

  onAttachedPhotoChanged() {
    if (this.formGroup.controls.photo.controls.photoFile.valid) {
      const photoFile = this.formGroup.controls.photo.controls.photoFile.value;
      if (photoFile) {
        const reader = new FileReader();
        reader.readAsDataURL(photoFile);

        reader.onload = () => {
          this.photoDetail.set(
            new PhotoDetail(
              photoFile.name,
              photoFile.size,
              reader.result as string,
            ),
          );
        };
      }

      this.formGroup.controls.photo.controls.existingPhoto.removeValidators(
        Validators.required,
      );
    } else {
      this.photoDetail.set(undefined);
      this.formGroup.controls.photo.controls.existingPhoto.addValidators(
        Validators.required,
      );
    }

    this.formGroup.controls.photo.controls.existingPhoto.updateValueAndValidity();
  }

  removeAttachedPhoto() {
    this.photoDetail.set(undefined);
    this.formGroup.controls.photo.controls.photoFile.setValue(null);
    this.formGroup.controls.photo.controls.existingPhoto.addValidators(
      Validators.required,
    );
    this.formGroup.controls.photo.controls.existingPhoto.updateValueAndValidity();
  }

  removeExistingPhoto() {
    this.formGroup.controls.photo.controls.existingPhoto.setValue(null);
    this.formGroup.controls.photo.controls.photoFile.addValidators(
      Validators.required,
    );
    this.formGroup.controls.photo.controls.photoFile.updateValueAndValidity();
  }

  private readonly _createSectionItemSubject = new Subject<FormData>();

  private readonly _createSectionItemTask = toSignal(
    this._createSectionItemSubject.pipe(
      tap(() => {
        this.formGroup.disable();
        this.isCreateProcess.set(true);
      }),
      switchMap((formData) =>
        this._mainPageSectionMpService
          .createWebsiteHeroSectionItem(
            this.websiteHeroSection()?.id!,
            formData,
          )
          .pipe(
            tap(() => {
              this._toastService.success(
                'The Website Hero Section Item has been created.',
              );
              this._router.navigate(['../../', 'details'], {
                relativeTo: this._activatedRoute,
              });
            }),
            catchHttpError(this._toastService, () => {
              this.isCreateProcess.set(false);
              this.formGroup.enable();
            }),
          ),
      ),
    ),
  );

  private readonly _loadMorePagedMainProductPhotosSubject = new Subject<
    Signal<PhotoMp[] | undefined>
  >();
  readonly isLoadPagedPhotos = signal(false);
  readonly isNextPagedPhotos = signal(true);

  readonly existingPhotos = toSignal(
    this._loadMorePagedMainProductPhotosSubject.pipe(
      tap(() => {
        this._getPagedWebsiteHeroSectionPhotosQueryParams.pageNumber += 1;
        this.isLoadPagedPhotos.set(true);
      }),
      switchMap((photosSig) =>
        this._photoMpService
          .getPagedWebsiteHeroSectionPhotos(
            this._getPagedWebsiteHeroSectionPhotosQueryParams,
          )
          .pipe(
            map((response) => {
              this.isNextPagedPhotos.set(response.isNext);

              const current = photosSig();

              if (current) {
                current.push(...response.data);

                return current;
              }

              return response.data;
            }),
            finalize(() => this.isLoadPagedPhotos.set(false)),
          ),
      ),
    ),
  );

  openPhotoGallery() {
    if (!this.existingPhotos() && !this.isLoadPagedPhotos()) {
      this._loadMorePagedMainProductPhotosSubject.next(this.existingPhotos);
    }

    this.openedPhotoGallery.set(true);
  }

  onChooseExistingPhoto() {
    const chosenPhoto =
      this.formGroup.controls.photo.controls.existingPhoto.value;

    if (chosenPhoto) {
      this.formGroup.controls.photo.controls.photoFile.removeValidators(
        Validators.required,
      );
    } else {
      this.formGroup.controls.photo.controls.photoFile.addValidators(
        Validators.required,
      );
    }

    this.formGroup.controls.photo.controls.photoFile.updateValueAndValidity();
  }

  create() {
    this.formGroup.markAllAsTouched();

    if (!this.formGroup.valid) {
      return;
    }

    const value = this.formGroup.value;

    const formData = new FormData();

    formData.append('websiteHeroSectionId', this.websiteHeroSection()!.id);

    if (value.position != undefined && value.position !== 'inactive') {
      formData.append('position', value.position.toString());
    }

    if (value.title) {
      formData.append('title', value.title);
    }

    if (value.subtitle) {
      formData.append('subtitle', value.subtitle);
    }

    if (value.routerLink) {
      formData.append('routerLink', value.routerLink);
    }

    if (value.photo?.photoFile) {
      formData.append(
        PhotoFormFileName.WebsiteHeroSectionPhoto,
        value.photo.photoFile,
      );
    }

    if (value.photo?.existingPhoto) {
      formData.append(
        'websiteHeroSectionPhotoId',
        value.photo.existingPhoto.id,
      );
    }

    this._createSectionItemSubject.next(formData);
  }
}
