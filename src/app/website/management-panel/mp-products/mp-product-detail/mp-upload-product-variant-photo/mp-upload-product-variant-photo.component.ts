import { NgClass } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatColor } from '../../../../../../themes/global-theme.service';
import { FileWithEncodedContent } from '../../../../../shared/models/helpers/file-with-encoded-content.class';
import { ValidationResult } from '../../../../../shared/models/helpers/validation-result.class';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PhotoMp } from '../../../models/photos/photo-mp.interface';

@Component({
  selector: 'app-mp-upload-product-variant-photo',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, FormsModule, NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: MpUploadProductVariantPhotoComponent,
    },
  ],
  templateUrl: './mp-upload-product-variant-photo.component.html',
  styleUrl: './mp-upload-product-variant-photo.component.scss',
})
export class MpUploadProductVariantPhotoComponent
  implements ControlValueAccessor, OnInit
{
  private readonly _toastService = inject(ToastService);

  readonly formControl =
    input.required<FormControl<(PhotoMp | FileWithEncodedContent)[] | null>>();
  readonly color = input<MatColor>('primary');
  readonly maxPhotosCount = input.required<number>();
  readonly maxFileSizeInMB = input.required<number>();
  readonly acceptPhotoFormats = input.required<string[]>();
  readonly acceptFormatType = input.required<string[]>();
  readonly valueChange = output();

  readonly value = signal<(PhotoMp | FileWithEncodedContent)[] | null>(null);

  readonly disabled = signal(false);

  ngOnInit(): void {
    if (this.maxPhotosCount() < 0) {
      throw Error('The field maxPhotosCount must be equal or greater than 0.');
    }
  }

  onChange(obj: (PhotoMp | FileWithEncodedContent)[] | null) {
    if (!obj) {
      this.value.set(obj);
    }
  }

  writeValue(obj: (PhotoMp | FileWithEncodedContent)[] | null) {}

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
        `Attached File/Files ${validationResult.validationErrors.length > 1 ? 'Errors' : 'Error'}`,
        true,
        5000,
      );

      return;
    }

    if (fileList) {
      const fileArray: File[] = [];

      for (let i = 0; i < fileList.length; i++) {
        fileArray.push(fileList.item(i)!);
      }

      const newFileWithEncodedContent: FileWithEncodedContent[] = [];

      fileArray.forEach((file, index) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        const currentValue = this.formControl().value ?? [];

        reader.onload = () => {
          newFileWithEncodedContent.push(
            new FileWithEncodedContent(file, reader.result as string),
          );

          if (index === fileArray.length - 1) {
            currentValue.push(...newFileWithEncodedContent);
            this.onChange(currentValue);
            this.valueChange.emit();
          }
        };
      });
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
          `The file '${file.name}' has wrong size (max. ${this.maxFileSizeInMB()} MB)`,
        );
      }

      if (
        !this.acceptFormatType().includes(file.type) ||
        !this.fileFormatFromNameIsValid(file.name)
      ) {
        validationErrors.push(
          `The file '${file.name}' has wrong file format (accepted ${this.acceptPhotoFormats().join(', ')})`,
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
            `The file '${tempFile.name}' has wrong size (max. ${this.maxFileSizeInMB()} MB)`,
          );
        }

        if (
          !this.acceptFormatType().includes(tempFile.type) ||
          !this.fileFormatFromNameIsValid(tempFile.name)
        ) {
          validationErrors.push(
            `The file '${tempFile.name}' has wrong file format (accepted ${this.acceptPhotoFormats().join(', ')})`,
          );
        }
      }
    }

    return new ValidationResult(validationErrors);
  }

  private fileFormatFromNameIsValid(name: string) {
    const splittedName = name.split('.');

    if (splittedName.length <= 1) {
      return false;
    }

    return this.acceptPhotoFormats().includes(
      `.${splittedName[splittedName.length - 1]}`,
    );
  }
}
