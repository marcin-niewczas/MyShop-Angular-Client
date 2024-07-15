import { Component, OnInit, inject, input, signal } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { toBoolean } from '../../functions/transform-functions';
import { ValidationResult } from '../../models/helpers/validation-result.class';
import { ToastService } from '../../services/toast.service';
import { MatColor } from '../../../../themes/global-theme.service';

@Component({
  selector: 'app-photo-file-input',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: PhotoFileInputComponent,
    },
  ],
  templateUrl: './photo-file-input.component.html',
  styleUrl: './photo-file-input.component.scss',
})
export class PhotoFileInputComponent implements OnInit, ControlValueAccessor {
  private readonly _toastService = inject(ToastService);

  readonly formControl = input.required<FormControl<File | File[] | null>>();
  readonly color = input<MatColor>('primary');
  readonly maxPhotosCount = input<number>();
  readonly multiple = input(false, { transform: toBoolean });
  readonly maxFileSizeInMB = input.required<number>();
  readonly acceptedPhotoExtensions = input.required<string[]>();
  readonly acceptedFormatType = input.required<string[]>();

  readonly value = signal<File | File[] | null>(null);

  readonly disabled = signal(false);

  ngOnInit(): void {
    if (this.maxPhotosCount()! <= 0) {
      throw Error('The field maxPhotosCount must be greater than 0.');
    }
  }

  onChange(obj: File | File[] | null) {
    if (!obj) {
      this.value.set(obj);
    }
  }

  writeValue(obj: File | File[] | null) {}

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {}

  setDisabledState?(isDisabled: boolean) {
    this.disabled.set(isDisabled);
  }

  onFileAdded(fileList: FileList | null) {
    const validationResult = this.validate(fileList);

    if (!validationResult.isValid) {
      this._toastService.error(
        validationResult.buildToastErrorMessage(),
        `Attached ${this.multiple() ? 'File/Files' : 'File'} ${
          validationResult.validationErrors.length > 1 ? 'Errors' : 'Error'
        }`,
        true,
        5000,
      );

      return;
    }

    if (this.multiple()) {
      if (fileList) {
        let fileArray: File[] = [];

        for (let i = 0; i < fileList.length; i++) {
          fileArray.push(fileList.item(i)!);
        }

        this.value.update((current) => {
          if (Array.isArray(current)) {
            current.push(...fileArray);
            fileArray = current;
            return current;
          }

          return fileArray;
        });

        this.onChange(fileArray);
      }
    } else {
      if (fileList?.length === 1) {
        const file = fileList.item(0);

        this.value.set(file);
        this.onChange(file);
      }
    }
  }

  private validate(obj: FileList | null) {
    const validationErrors: string[] = [];

    if (!obj) {
      validationErrors.push('Incorrect format');
      return new ValidationResult(validationErrors);
    }

    if (obj.length <= 0) {
      validationErrors.push('Empty files list');
      return new ValidationResult(validationErrors);
    }

    if (this.maxPhotosCount()! < obj.length) {
      validationErrors.push(
        `You can add max. ${this.maxPhotosCount()} photos now`,
      );
      return new ValidationResult(validationErrors);
    }

    if (obj.length === 1) {
      const file = obj.item(0);

      if (!file) {
        validationErrors.push('Incorrect file format');
        return new ValidationResult(validationErrors);
      }

      if (file.size > this.maxFileSizeInMB() * 1024 * 1024) {
        validationErrors.push(
          `The file '${
            file.name
          }' has wrong size (max. ${this.maxFileSizeInMB()} MB)`,
        );
      }

      if (
        !this.acceptedFormatType().includes(file.type) ||
        !this.fileFormatFromNameIsValid(
          file.name,
          this.acceptedPhotoExtensions(),
        )
      ) {
        validationErrors.push(
          `The file '${
            file.name
          }' has wrong file format (accepted ${this.acceptedPhotoExtensions().join(
            ', ',
          )})`,
        );
      }
    }

    if (obj.length > 1) {
      let tempFile: File | null;

      for (let i = 0; i < obj.length; i++) {
        tempFile = obj.item(i);
        if (!tempFile) {
          validationErrors.push(`Incorrect file format`);
          continue;
        }

        if (tempFile.size > this.maxFileSizeInMB() * 1024 * 1024) {
          validationErrors.push(
            `The file '${
              tempFile.name
            }' has wrong size (max. ${this.maxFileSizeInMB()} MB)`,
          );
        }

        if (
          !this.acceptedFormatType().includes(tempFile.type) ||
          !this.fileFormatFromNameIsValid(
            tempFile.name,
            this.acceptedPhotoExtensions(),
          )
        ) {
          validationErrors.push(
            `The file '${
              tempFile.name
            }' has wrong file format (accepted ${this.acceptedPhotoExtensions().join(
              ', ',
            )})`,
          );
        }
      }
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
