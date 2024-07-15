import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryMpService } from '../../services/category-mp.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { CreateCategoryMp } from '../../models/category/create-category-mp.class';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../shared/validators/custom-validator';

@Component({
  selector: 'app-mp-main-category-create',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
  ],
  templateUrl: './mp-main-category-create.component.html',
  styleUrl: './mp-main-category-create.component.scss',
})
export class MpMainCategoryCreateComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _categoryMpService = inject(CategoryMpService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _toastService = inject(ToastService);

  readonly form = this._formBuilder.group({
    categoryName: new FormControl('', [
      Validators.required,
      CustomValidators.nullOrWhitespace,
    ]),
  });

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Main Categories', routerLink: '../' },
    { label: 'Create Main Category' },
  ];

  private readonly _createTaskSubject = new Subject<CreateCategoryMp>();

  readonly isCreateProcess = signal(false);

  private readonly _createTask = toSignal(
    this._createTaskSubject.pipe(
      tap(() => {
        this.isCreateProcess.set(true);
        this.form.disable();
      }),
      switchMap((model) =>
        this._categoryMpService.create(model).pipe(
          tap((response) => {
            this._toastService.success('Main Category has been created.');
            this._router.navigate(['../', response.id], {
              relativeTo: this._activatedRoute,
            });
          }),
          catchHttpError(this._toastService, () => {
            this.isCreateProcess.set(false);
            this.form.enable();
          }),
        ),
      ),
    ),
  );

  create() {
    if (!this.form.valid) {
      return;
    }

    this._createTaskSubject.next(
      new CreateCategoryMp(this.form.value.categoryName!),
    );
  }
}
