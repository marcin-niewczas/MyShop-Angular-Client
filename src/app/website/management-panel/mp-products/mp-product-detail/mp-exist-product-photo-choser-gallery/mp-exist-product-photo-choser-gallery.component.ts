import {
  Component,
  HostListener,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatColor } from '../../../../../../themes/global-theme.service';
import {
  inOutAnimation,
  inAnimation,
} from '../../../../../shared/components/animations';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../../../shared/components/photo/photo.component';
import { ShadowOverlayComponent } from '../../../../../shared/components/shadow-overlay/shadow-overlay.component';
import { CheckMaxHeightDirective } from '../../../../../shared/directives/check-max-height.directive';
import { FileWithEncodedContent } from '../../../../../shared/models/helpers/file-with-encoded-content.class';
import { FileSizePipe } from '../../../../../shared/pipes/file-size.pipe';
import { ToastService } from '../../../../../shared/services/toast.service';
import { PhotoMp } from '../../../models/photos/photo-mp.interface';

@Component({
  selector: 'app-mp-exist-product-photo-choser-gallery',
  standalone: true,
  imports: [
    ShadowOverlayComponent,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    FileSizePipe,
    InfiniteScrollDirective,
    CheckMaxHeightDirective,
    PhotoComponent,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './mp-exist-product-photo-choser-gallery.component.html',
  styleUrl: './mp-exist-product-photo-choser-gallery.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: MpExistProductPhotoChoserGalleryComponent,
    },
  ],
  animations: [inOutAnimation, inAnimation],
})
export class MpExistProductPhotoChoserGalleryComponent
  implements OnChanges, ControlValueAccessor
{
  private readonly _toastService = inject(ToastService);

  private _canShowError = true;

  onChange(obj: (PhotoMp | FileWithEncodedContent)[] | null) {}

  writeValue(obj: (PhotoMp | FileWithEncodedContent)[] | null): void {}

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler() {
    if (this.opened()) {
      this.opened.set(false);
    }
  }

  readonly opened = model.required<boolean>();

  readonly formControl =
    input.required<FormControl<(PhotoMp | FileWithEncodedContent)[] | null>>();
  readonly data = input.required<PhotoMp[] | undefined>();
  readonly isLoad = input.required<boolean>();
  readonly isNext = input.required<boolean>();
  readonly color = input<MatColor>('primary');
  readonly headerTitle = input.required<string>();
  readonly loadMore = output();
  readonly valueChange = output();
  readonly maxChooseCount = input<number>();
  readonly canChoose = input(true);

  ngOnChanges(changes: SimpleChanges): void {
    if (this.opened()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  onInputChange(value: PhotoMp, element: HTMLInputElement) {
    if (!this.canChoose() && !element.checked) {
      if (this._canShowError) {
        this._toastService.error(
          `Each Product Variant can have max. ${this.maxChooseCount()} photos.`,
          undefined,
          false,
          5000,
        );

        this._canShowError = false;

        setTimeout(() => (this._canShowError = true), 5000);
      }

      return;
    }

    element.checked = !element.checked;

    if (this.maxChooseCount()! >= 1) {
      const formValue = this.formControl().value;

      if (Array.isArray(formValue)) {
        if (element.checked) {
          formValue.push(value);
          this.onChange(formValue);
        } else {
          if (formValue.length === 1) {
            this.onChange(null);
          } else {
            const index = formValue.findIndex(
              (p) =>
                !(p instanceof FileWithEncodedContent) && p.id === value.id,
            );

            if (index !== -1) {
              formValue.splice(index, 1);
              this.onChange(formValue);
            }
          }
        }
      } else {
        if (element.checked) {
          this.onChange([value]);
        }
      }
    }

    this.valueChange.emit();
  }

  isChecked(value: PhotoMp) {
    const formValue = this.formControl().value;

    if (!formValue) {
      return false;
    }

    return (
      formValue.findIndex(
        (p) => !(p instanceof FileWithEncodedContent) && p.id === value.id,
      ) !== -1
    );
  }

  getBackgroundColor() {
    switch (this.color()) {
      case 'primary':
        return 'primary-background-color';
      case 'accent':
        return 'accent-background-color';
      case 'warn':
        return 'warn-background-color';
    }
  }
}
