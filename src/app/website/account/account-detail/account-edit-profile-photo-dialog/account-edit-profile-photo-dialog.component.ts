import { Component, DestroyRef, inject, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserAcService } from '../../services/user-ac.service';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { filter, finalize, first, switchMap, tap } from 'rxjs';
import { inAnimation } from '../../../../shared/components/animations';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { PhotoDetail } from '../../../../shared/models/helpers/photo-detail.class';
import { PhotoFormFileName } from '../../../../shared/models/helpers/photo-form-file-name.enum';
import { ValidationResult } from '../../../../shared/models/helpers/validation-result.class';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../authenticate/auth.service';

@Component({
  selector: 'app-account-edit-profile-photo-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    AvatarComponent,
    LoadingComponent,
    SidebarComponent,
  ],
  templateUrl: './account-edit-profile-photo-dialog.component.html',
  styleUrl: './account-edit-profile-photo-dialog.component.scss',
  animations: [inAnimation],
})
export class AccountEditProfilePhotoDialogComponent {
  private readonly _authService = inject(AuthService);
  private readonly _userAcService = inject(UserAcService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _toastService = inject(ToastService);

  readonly user = this._authService.currentUser;
  readonly opened = model.required<boolean>();
  readonly isUploadProcess = signal(false);
  readonly isRemoveProcess = signal(false);

  readonly attachmentFileDetail = signal<{
    file: File;
    photoDetail: PhotoDetail;
  } | null>(null);

  readonly validatorParameters = toSignal(
    toObservable(this.opened).pipe(
      filter((value) => value),
      first(),
      switchMap(() => this._userAcService.getUserPhotoValidatorParameters()),
    ),
  );

  onPhotoAttached(fileList: FileList | null) {
    const validationResult = this.validate(fileList);

    if (!validationResult.isValid) {
      this._toastService.error(
        validationResult.buildToastErrorMessage(),
        'Wrong File',
        true,
        5000,
      );
      return;
    }

    const file = fileList!.item(0);

    if (file) {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        this.attachmentFileDetail.set({
          file: file,
          photoDetail: new PhotoDetail(
            file.name,
            file.size,
            reader.result as string,
          ),
        });
      };
    }
  }

  removeAttachmentPhoto() {
    this.attachmentFileDetail.set(null);
  }

  uploadPhoto() {
    const formData = new FormData();

    formData.append(
      PhotoFormFileName.UserPhoto,
      this.attachmentFileDetail()?.file!,
    );

    this.isUploadProcess.set(true);

    this._userAcService
      .updateUserPhoto(formData)
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        tap(() => {
          this.attachmentFileDetail.set(null);
          this._toastService.success('The Photo has been uploaded.');
        }),
        catchHttpError(this._toastService),
        finalize(() => this.isUploadProcess.set(false)),
      )
      .subscribe();
  }

  removePhoto() {
    this.isRemoveProcess.set(true);

    this._userAcService
      .removeUserPhoto()
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        tap(() => this._toastService.success('The Photo has been removed.')),
        catchHttpError(this._toastService),
        finalize(() => this.isRemoveProcess.set(false)),
      )
      .subscribe();
  }

  private validate(fileList: FileList | null) {
    const validationErrors: string[] = [];

    const photoFileValidatorParams =
      this.validatorParameters()?.photoFileParams!;

    if (!fileList) {
      validationErrors.push('Incorrect format');
      return new ValidationResult(validationErrors);
    }

    if (fileList.length <= 0) {
      validationErrors.push('Empty files list');
      return new ValidationResult(validationErrors);
    }

    if (fileList.length !== 1) {
      validationErrors.push('Accept only one photo');
      return new ValidationResult(validationErrors);
    }

    const file = fileList.item(0);

    if (!file) {
      validationErrors.push('Incorrect file format');
      return new ValidationResult(validationErrors);
    }

    if (file.size > photoFileValidatorParams.maxSizeInMegabytes * 1024 * 1024) {
      validationErrors.push(
        `The file '${file.name}' has wrong size (max. ${photoFileValidatorParams.maxSizeInMegabytes} MB)`,
      );
    }

    if (
      !photoFileValidatorParams.allowedContentTypes.includes(file.type) ||
      !this.fileFormatFromNameIsValid(
        file.name,
        photoFileValidatorParams.allowedPhotoExtensions,
      )
    ) {
      validationErrors.push(
        `The file '${file.name}' has wrong file format (accepted ${photoFileValidatorParams.allowedPhotoExtensions}).join(', ')})`,
      );
    }

    return new ValidationResult(validationErrors);
  }

  private fileFormatFromNameIsValid(
    name: string,
    allowedPhotoExtensions: readonly string[],
  ) {
    const splittedName = name.split('.');

    if (splittedName.length <= 1) {
      return false;
    }

    return allowedPhotoExtensions.includes(
      `.${splittedName[splittedName.length - 1]}`,
    );
  }
}
