import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { Subject, map, switchMap, tap } from 'rxjs';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../shared/validators/custom-validator';
import { AuthService } from '../../../authenticate/auth.service';
import { UpdateUserEmailAc } from '../../models/user/update-user-email-ac.class';
import { UserAcService } from '../../services/user-ac.service';

@Component({
  selector: 'app-account-security-update-email',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    MatIconModule,
    RouterLink,
    BreadcrumbsComponent,
  ],
  templateUrl: './account-security-update-email.component.html',
  styleUrl: './account-security-update-email.component.scss',
})
export class AccountSecurityUpdateEmailComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _userAcService = inject(UserAcService);
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  private readonly _updateEmailSubject = new Subject<UpdateUserEmailAc>();

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Security', routerLink: '/account/security' },
    { label: 'Update E-mail' },
  ];

  private readonly _updateEmail = toSignal(
    this._updateEmailSubject.pipe(
      tap(() => {
        this.formGroup.disable();
        this.isUpdateProcess.set(true);
      }),
      switchMap((model) =>
        this._userAcService.updateUserEmail(model).pipe(
          tap(() => this._router.navigate(['account', 'security'])),
          catchHttpError(this._toastService, () => {
            this.isUpdateProcess.set(false);
            this.formGroup.enable();
          }),
        ),
      ),
    ),
  );

  get validatorParameters() {
    return this._userAcService.securityValidatorParameters;
  }

  readonly formGroup = this._formBuilder.group({
    newEmail: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.emailParams!),
    ),
    password: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.passwordParams!),
    ),
  });

  readonly canUpdate = toSignal(
    this.formGroup.valueChanges.pipe(
      map((formValues) => {
        if (!this.formGroup.valid) {
          return false;
        }

        if (formValues.newEmail !== this._authService.currentUser()?.email) {
          return true;
        }

        return false;
      }),
    ),
  );

  readonly isUpdateProcess = signal(false);

  hasError(formControlName: string, errorType: string) {
    return this.formGroup.get(formControlName)?.hasError(errorType);
  }

  updateEmail() {
    if (!this.formGroup.valid) {
      return;
    }

    const formValues = this.formGroup.value;

    this._updateEmailSubject.next(
      new UpdateUserEmailAc(formValues.newEmail!, formValues.password!),
    );
  }
}
