import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map, tap, Subject, finalize, switchMap } from 'rxjs';
import { CategoryMp } from '../../../models/category/category-mp.interface';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../../shared/validators/custom-validator';
import { CreateCategoryMp } from '../../../models/category/create-category-mp.class';
import { CategoryMpService } from '../../../services/category-mp.service';
import { CategoryHelperMpService } from '../../category-helper-mp.service';

@Component({
  selector: 'app-mp-subcategory-create',
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
  templateUrl: './mp-subcategory-create.component.html',
  styleUrl: './mp-subcategory-create.component.scss',
})
export class MpSubcategoryCreateComponent {
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

  readonly parentCategory = toSignal(
    this._activatedRoute.data.pipe(
      map(({ category }) => {
        this.formGroup.reset();
        return category as CategoryMp;
      }),
    ),
  );

  private readonly _createTaskSubject = new Subject<CreateCategoryMp>();

  readonly isCreateProcess = signal(false);

  private readonly _createTask = toSignal(
    this._createTaskSubject.pipe(
      tap(() => {
        this.isCreateProcess.set(true);
        this.formGroup.disable();
      }),
      switchMap((model) =>
        this._categoryMpService.create(model).pipe(
          tap((data) => {
            this._toastService.success('Subcategory has been created.');

            this._categoryHelperMpService.emitRefreshTreeCategory();

            if (this.parentCategory()?.parentCategoryId) {
              this._router.navigate(['../../', data.id], {
                relativeTo: this._activatedRoute,
              });
            } else {
              this._router.navigate(['../', 'subcategories', data.id], {
                relativeTo: this._activatedRoute,
              });
            }
          }),
          catchHttpError(this._toastService),
          finalize(() => {
            this.isCreateProcess.set(false);
            this.formGroup.enable();
          }),
        ),
      ),
    ),
  );

  create() {
    if (!this.formGroup.valid) {
      return;
    }

    this._createTaskSubject.next(
      new CreateCategoryMp(
        this.formGroup.controls.name.value!,
        this.parentCategory()?.id,
      ),
    );
  }
}
