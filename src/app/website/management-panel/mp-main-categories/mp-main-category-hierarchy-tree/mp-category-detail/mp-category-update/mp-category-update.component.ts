import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, finalize, map, switchMap, tap } from 'rxjs';
import { CategoryHelperMpService } from '../../../category-helper-mp.service';
import { LoadingComponent } from '../../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../../../shared/validators/custom-validator';
import { CategoryMp } from '../../../../models/category/category-mp.interface';
import { UpdateCategoryMp } from '../../../../models/category/update-category-mp.class';
import { CategoryMpService } from '../../../../services/category-mp.service';

@Component({
  selector: 'app-mp-category-update',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    LoadingComponent,
  ],
  templateUrl: './mp-category-update.component.html',
  styleUrl: './mp-category-update.component.scss',
})
export class MpCategoryUpdateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _categoryMpService = inject(CategoryMpService);
  private readonly _categoryHelperMpService = inject(CategoryHelperMpService);

  get validatorParameters() {
    return this._categoryMpService.validatorParameters;
  }

  readonly formGroup = this._formBuilder.group({
    name: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.categoryNameParams!,
      ),
    ),
  });

  readonly category = toSignal(
    this._activatedRoute.data.pipe(
      map(({ category }) => {
        const data = category as CategoryMp;
        this.formGroup.controls.name.setValue(data.name);

        return data;
      }),
    ),
  );

  readonly canUpdate = toSignal(
    this.formGroup.valueChanges.pipe(
      map((formValue) => formValue.name !== this.category()?.name),
    ),
  );

  private readonly _updateTaskSubject = new Subject<UpdateCategoryMp>();

  readonly isUpdateProcess = signal(false);

  private readonly _updateTask = toSignal(
    this._updateTaskSubject.pipe(
      tap(() => {
        this.isUpdateProcess.set(true);
        this.formGroup.disable();
      }),
      switchMap((model) =>
        this._categoryMpService.update(this.category()?.id!, model).pipe(
          tap(() => {
            if (this.category()?.parentCategoryId) {
              this._toastService.success('Main Category has been updated.');
            } else {
              this._toastService.success('Subcategory has been updated.');
            }

            this._categoryHelperMpService.emitRefreshTreeCategory();
            this._router.navigate(['../'], {
              relativeTo: this._activatedRoute,
            });
          }),
          catchHttpError(this._toastService),
          finalize(() => {
            this.isUpdateProcess.set(false);
            this.formGroup.enable();
          }),
        ),
      ),
    ),
  );

  update() {
    if (!this.formGroup.valid) {
      return;
    }

    this._updateTaskSubject.next(
      new UpdateCategoryMp(
        this.category()?.id!,
        this.formGroup.controls.name.value!,
      ),
    );
  }
}
