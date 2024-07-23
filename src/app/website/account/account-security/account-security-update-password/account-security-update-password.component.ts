import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { Subject, tap, switchMap } from 'rxjs';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../shared/validators/custom-validator';
import { UpdateUserPasswordAc } from '../../models/user/update-user-password-ac.class';
import { UserAcService } from '../../services/user-ac.service';
import { DebounceFunction } from '../../../../shared/functions/debounce-function';

@Component({
  selector: 'app-account-security-update-password',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    MatIconModule,
    RouterLink,
    MatSlideToggleModule,
    BreadcrumbsComponent,
    MatTooltipModule,
  ],
  templateUrl: './account-security-update-password.component.html',
  styleUrl: './account-security-update-password.component.scss',
})
export class AccountSecurityUpdatePasswordComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _userAcService = inject(UserAcService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Security', routerLink: '/account/security' },
    { label: 'Update Password' },
  ];

  private readonly _updatePasswordSubject = new Subject<UpdateUserPasswordAc>();

  private readonly _updatePassword = toSignal(
    this._updatePasswordSubject.pipe(
      tap(() => {
        this.formGroup.disable();
        this.isUpdateProcess.set(true);
      }),
      switchMap((model) =>
        this._userAcService.updateUserPassword(model).pipe(
          tap(() => this._router.navigate(['account', 'security'])),
          catchHttpError(this._toastService, () => {
            this.isUpdateProcess.set(false);
            this.formGroup.enable();
          }),
        ),
      ),
    ),
  );

  readonly formGroup = this._formBuilder.group({
    oldPassword: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.passwordParams!),
    ),
    newPassword: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.passwordParams!),
    ),
    confirmNewPassword: this._formBuilder.control('', [
      ...CustomValidators.mapValidators(
        this.validatorParameters?.passwordParams!,
      ),
      CustomValidators.equalsTo('newPassword'),
    ]),
    logoutOtherDevices: this._formBuilder.control(false, Validators.required),
  });

  get validatorParameters() {
    return this._userAcService.securityValidatorParameters;
  }

  readonly isUpdateProcess = signal(false);

  hasError(formControlName: string, errorType: string) {
    return this.formGroup.get(formControlName)?.hasError(errorType);
  }

  updatePassword() {
    if (!this.formGroup.valid) {
      return;
    }

    const formValues = this.formGroup.value;

    this._updatePasswordSubject.next(
      new UpdateUserPasswordAc(
        formValues.oldPassword!,
        formValues.newPassword!,
        formValues.confirmNewPassword!,
        formValues.logoutOtherDevices!,
      ),
    );
  }

  @DebounceFunction(200)
  refreshAndValidateFormControl(control: FormControl) {
    control.updateValueAndValidity();
  }
}
