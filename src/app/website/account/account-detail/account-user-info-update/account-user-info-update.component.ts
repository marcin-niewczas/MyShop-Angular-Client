import { DatePipe, KeyValuePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, map, switchMap, tap } from 'rxjs';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../shared/validators/custom-validator';
import { AuthService } from '../../../authenticate/auth.service';
import { UpdateUserAc } from '../../models/user/update-user-ac.class';
import { UserAcService } from '../../services/user-ac.service';


@Component({
  selector: 'app-account-user-info-update',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    LoadingComponent,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    KeyValuePipe,
    RouterLink,
    BreadcrumbsComponent,
    DatePipe,
  ],
  providers: [MatDatepickerModule, MatNativeDateModule, DatePipe],
  templateUrl: './account-user-info-update.component.html',
  styleUrl: './account-user-info-update.component.scss',
})
export class AccountUserInfoUpdateComponent {
  private readonly _userAcService = inject(UserAcService);
  private readonly _authService = inject(AuthService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _datePipe = inject(DatePipe);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);

  readonly user = this._authService.currentUser;

  get validatorParameters() {
    return this._userAcService.userValidatorParameters;
  }

  readonly isUpdateProcess = signal(false);

  readonly isUserInfoUpdateMode = signal(false);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Account Info', routerLink: '/account/info' },
    { label: 'Update User Info' },
  ];

  readonly updateUserInfoFormGroup = this._formBuilder.group({
    firstName: this._formBuilder.control(
      this.user()?.firstName,
      CustomValidators.mapValidators(
        this._userAcService.userValidatorParameters?.firstNameParams!,
      ),
    ),
    lastName: this._formBuilder.control(
      this.user()?.lastName,
      CustomValidators.mapValidators(
        this._userAcService.userValidatorParameters?.lastNameParams!,
      ),
    ),
    dateOfBirth: this._formBuilder.control(
      this.user()?.dateOfBirth,
      Validators.required,
    ),
    gender: this._formBuilder.control(this.user()?.gender, Validators.required),
    phoneNumber: this._formBuilder.control(
      this.user()?.phoneNumber,
      CustomValidators.mapValidators(
        this._userAcService.userValidatorParameters?.phoneNumberParams!,
      ),
    ),
  });

  readonly canUpdate = toSignal(
    this.updateUserInfoFormGroup.valueChanges.pipe(
      map((formValues) => {
        if (this.user()?.firstName !== formValues.firstName) {
          return true;
        }

        if (this.user()?.lastName !== formValues.lastName) {
          return true;
        }

        if (
          this.user()?.dateOfBirth &&
          new Date(this.user()!.dateOfBirth).toLocaleDateString() !==
            new Date(formValues.dateOfBirth!).toLocaleDateString()
        ) {
          return true;
        }

        if (this.user()?.gender !== formValues.gender) {
          return true;
        }

        if (this.user()?.phoneNumber !== formValues.phoneNumber) {
          return true;
        }

        return false;
      }),
    ),
  );

  private readonly _updateUserTaskSubject = new Subject<UpdateUserAc>();

  private readonly _updateUserTask = toSignal(
    this._updateUserTaskSubject.pipe(
      tap(() => {
        this.updateUserInfoFormGroup.disable();
        this.isUpdateProcess.set(true);
      }),
      switchMap((model) =>
        this._userAcService.updateUser(model).pipe(
          tap(() => {
            this._toastService.success('The User Data has been updated.');
            this._router.navigate(['../'], {
              relativeTo: this._activatedRoute,
            });
          }),
          catchHttpError(this._toastService, () => {
            this.isUpdateProcess.set(false);
            this.updateUserInfoFormGroup.enable();
          }),
        ),
      ),
    ),
  );

  updateUserInfo() {
    if (!this.updateUserInfoFormGroup.valid) {
      return;
    }

    const formValues = this.updateUserInfoFormGroup.value;

    this._updateUserTaskSubject.next(
      new UpdateUserAc(
        formValues.firstName!,
        formValues.lastName!,
        formValues.gender!,
        this._datePipe.transform(formValues.dateOfBirth, 'yyyy-MM-dd')!,
        formValues.phoneNumber!,
      ),
    );
  }
}
