import { NgClass } from '@angular/common';
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
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { CheckMaxHeightDirective } from '../../directives/check-max-height.directive';
import { FileSizePipe } from '../../pipes/file-size.pipe';
import { LoadingComponent } from '../loading/loading.component';
import { PhotoComponent } from '../photo/photo.component';
import { ShadowOverlayComponent } from '../shadow-overlay/shadow-overlay.component';
import { ToastService } from '../../services/toast.service';
import { inAnimation, inOutAnimation } from '../animations';
import { MatColor } from '../../../../themes/global-theme.service';
import { PhotoMp } from '../../../website/management-panel/models/photos/photo-mp.interface';

@Component({
  selector: 'app-photo-gallery-input-dialog',
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: PhotoGalleryInputDialogComponent,
    },
  ],
  animations: [inOutAnimation, inAnimation],
  templateUrl: './photo-gallery-input-dialog.component.html',
  styleUrl: './photo-gallery-input-dialog.component.scss',
})
export class PhotoGalleryInputDialogComponent
  implements OnChanges, ControlValueAccessor
{
  private readonly _toastService = inject(ToastService);

  private _canShowError = true;

  onChange(obj: PhotoMp | PhotoMp[] | null) {
    console.log(obj);
  }

  writeValue(obj: any): void {}

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
    input.required<FormControl<PhotoMp | PhotoMp[] | null>>();
  readonly data = input.required<PhotoMp[] | undefined>();
  readonly isLoad = input.required<boolean>();
  readonly isNext = input.required<boolean>();
  readonly color = input<MatColor>('primary');
  readonly headerTitle = input.required<string>();
  readonly loadMore = output();
  readonly change = output();
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
          `You can choose or attach max. ${this.maxChooseCount()} photos.`,
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
            const index = formValue.findIndex((p) => p.id === value.id);

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
    } else {
      if (element.checked) {
        this.onChange(value);
      } else {
        this.onChange(null);
      }
    }

    this.change.emit();
  }

  isChecked(value: PhotoMp) {
    const formValue = this.formControl().value;

    if (!formValue) {
      return false;
    }

    if (Array.isArray(formValue)) {
      return formValue.findIndex((p) => p.id === value.id) !== -1;
    }

    return formValue.id === value.id;
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
