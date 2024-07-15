import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { CustomValidators } from '../../../shared/validators/custom-validator';
import { AuthService } from '../auth.service';
import { SignUpCustomerAuth } from '../models/sign-up-customer-auth.class';
import { ToastService } from '../../../shared/services/toast.service';
import { SignInAuth } from '../models/sign-in-auth.class';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, finalize, switchMap, tap } from 'rxjs';
import { NotificationService } from '../../../shared/services/notification.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';
import { inAnimation } from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { Gender } from '../../../shared/models/responses/user/gender.enum';
import { catchHttpError } from '../../../shared/helpers/pipe-helpers';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSelectModule,
    RouterLink,
    MatDatepickerModule,
    MatNativeDateModule,
    LoadingComponent,
    KeyValuePipe,
    MatTooltipModule,
  ],
  providers: [DatePipe],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  animations: [inAnimation],
})
export class AuthComponent implements OnInit {
  private readonly _formBuiler = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _datePipe = inject(DatePipe);
  private readonly _notificationService = inject(NotificationService);

  @ViewChild('resetButton', { static: true }) resetButtonRef!: ElementRef;

  readonly hideSignUpPassword = signal(true);
  readonly hideSignInPassword = signal(true);
  readonly isProcess = signal(false);

  get validatorParameters() {
    return this._authService.validatorParameters;
  }

  readonly signInFormGroup = this._formBuiler.group({
    email: this._formBuiler.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.emailParams!),
    ),
    password: this._formBuiler.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.passwordParams!),
    ),
  });

  readonly signUpFormGroup = this._formBuiler.group({
    email: this._formBuiler.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.emailParams!),
    ),
    password: this._formBuiler.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.passwordParams!),
    ),
    confirmPassword: this._formBuiler.control('', [
      ...CustomValidators.mapValidators(
        this.validatorParameters?.passwordParams!,
      ),
      CustomValidators.equalsTo('password'),
    ]),
    firstName: this._formBuiler.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.firstNameParams!,
      ),
    ),
    lastName: this._formBuiler.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.lastNameParams!),
    ),
    dateOfBirth: this._formBuiler.control('', Validators.required),
    gender: this._formBuiler.control('' as Gender, Validators.required),
    phoneNumber: this._formBuiler.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.phoneNumberParams!,
      ),
    ),
  });

  selectedIndex = 0;

  ngOnInit(): void {
    const state = this._router.lastSuccessfulNavigation?.extras?.state;

    if (state) {
      this.selectedIndex = state['selectedIndex'] ?? 0;
    }
  }

  private readonly _signUpSubject = new Subject<SignUpCustomerAuth>();

  private readonly _signUpTask = toSignal(
    this._signUpSubject.pipe(
      tap(() => {
        this.signUpFormGroup.disable();
        this.isProcess.set(true);
      }),
      switchMap((model) =>
        this._authService.signUpCustomer(model).pipe(
          tap(() => {
            this._toastService.success('Account has been created.');
            this.signUpFormGroup.reset();
            this.resetButtonRef.nativeElement.click();
            this.selectedIndex = 0;
          }),
          catchHttpError(this._toastService),
          finalize(() => {
            this.isProcess.set(false);
            this.signUpFormGroup.enable();
          }),
        ),
      ),
    ),
  );

  signUp() {
    if (!this.signUpFormGroup.valid) {
      return;
    }

    const formValue = this.signUpFormGroup.value;

    this._signUpSubject.next(
      new SignUpCustomerAuth(
        formValue.firstName!,
        formValue.lastName!,
        formValue.email!,
        formValue.password!,
        formValue.confirmPassword!,
        formValue.gender!,
        this._datePipe.transform(formValue.dateOfBirth, 'yyyy-MM-dd')!,
        formValue.phoneNumber!,
      ),
    );
  }

  private readonly _signInSubject = new Subject<SignInAuth>();

  private readonly _signInTask = toSignal(
    this._signInSubject.pipe(
      tap(() => {
        this.signInFormGroup.disable();
        this.isProcess.set(true);
      }),
      switchMap((model) =>
        this._authService.signIn(model).pipe(
          switchMap(() => {
            this._notificationService.loadMoreNotifications();
            return this._authService.getUserMe().pipe(
              tap(() => {
                this._router.navigate(['./']);
                this._toastService.success('Login Succesfull.');
              }),
            );
          }),
          catchHttpError(this._toastService, () => {
            this.isProcess.set(false);
            this.signInFormGroup.enable();
          }),
        ),
      ),
    ),
  );

  signIn() {
    if (!this.signInFormGroup.valid) {
      return;
    }

    const formValue = this.signInFormGroup.value;

    this._signInSubject.next(
      new SignInAuth(formValue.email!, formValue.password!),
    );
  }

  onSelectedIndexChange(indexTab: number) {
    if (indexTab === 1) {
      this.signUpFormGroup.reset();
    }
  }
}
