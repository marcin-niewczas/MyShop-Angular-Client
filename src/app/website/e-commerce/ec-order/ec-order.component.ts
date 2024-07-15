import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, KeyValuePipe, NgOptimizedImage } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { ShoppingCartEcService } from '../services/shopping-cart-ec.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { PaymentMethod } from '../../../shared/models/order/payment-method.enum';
import { getPaymentIcon } from '../../../shared/functions/payment-functions';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Subject,
  catchError,
  delay,
  filter,
  finalize,
  map,
  of,
  repeat,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DeliveryMethod } from '../../../shared/models/order/delivery-method.enum';
import { getDeliveryIcon } from '../../../shared/functions/delivery-functions';
import {
  CdkStep,
  STEPPER_GLOBAL_OPTIONS,
  StepperSelectionEvent,
} from '@angular/cdk/stepper';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import {
  inAnimation,
  outAnimation,
} from '../../../shared/components/animations';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PhotoComponent } from '../../../shared/components/photo/photo.component';
import { ShadowOverlayComponent } from '../../../shared/components/shadow-overlay/shadow-overlay.component';
import { OrderStatus } from '../../../shared/models/responses/order/order-status.enum';
import { BreakpointObserverService } from '../../../shared/services/breakpoint-observer.service';
import { CustomValidators } from '../../../shared/validators/custom-validator';
import { UserAddressAc } from '../../account/models/user/user-address-ac.interface';
import { UserAddressAcService } from '../../account/services/user-address-ac.service';
import { AuthService } from '../../authenticate/auth.service';
import {
  CreateGuestOrderEc,
  CreateAuthUserOrderEc,
} from '../models/order/create-order-ec.class';
import {
  ECommerceRouteService,
  ECommerceRouteSection,
} from '../services/ecommerce-route.service';
import { OrderEcService } from '../services/order-ec.service';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-ec-order',
  standalone: true,
  imports: [
    MatStepperModule,
    RouterModule,
    MatDividerModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    FaIconComponent,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    LoadingComponent,
    MatCheckboxModule,
    CurrencyPipe,
    KeyValuePipe,
    PhotoComponent,
    ShadowOverlayComponent,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  templateUrl: './ec-order.component.html',
  styleUrl: './ec-order.component.scss',
  animations: [inAnimation, outAnimation],
})
export class EcOrderComponent implements OnInit, OnDestroy {
  private readonly _shoppingCartEcService = inject(ShoppingCartEcService);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _userAddressAcService = inject(UserAddressAcService);
  private readonly _authService = inject(AuthService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _orderEcService = inject(OrderEcService);
  private readonly _eCommerceRouteService = inject(ECommerceRouteService);
  private readonly _router = inject(Router);

  readonly breakpointObserverService = inject(BreakpointObserverService);

  get validatorParameters() {
    return this._orderEcService.validatorParameters;
  }

  readonly shoppingCartItems = this._shoppingCartEcService.shoppingCartItems;
  readonly totalPrice = this._shoppingCartEcService.totalPrice;

  readonly shoppingCartChanges =
    this._shoppingCartEcService.shoppingCartChanges;

  readonly PaymentMethod = PaymentMethod;
  readonly DeliveryMethod = DeliveryMethod;

  readonly hasCustomerPermission = this._authService.hasCustomerPermission;

  readonly getPaymentIcon = getPaymentIcon;
  readonly getDeliveryIcon = getDeliveryIcon;

  private readonly _loadUserAddressSubject = new Subject<void>();
  private readonly _checkoutIdSubject = new Subject<void>();

  stepperIndex = 0;

  readonly isCreateOrderProcess = signal(false);
  readonly isWaitingForRedirection = signal(false);

  readonly userAddresses = toSignal(
    this._loadUserAddressSubject.pipe(
      switchMap(() =>
        this._userAddressAcService.getAll().pipe(
          map((response) => {
            if (response.data.length > 0) {
              let defaultAddress = response.data.find((a) => a.isDefault);

              if (defaultAddress) {
                this.setDeliveryAddressForm(defaultAddress);
              }
            }

            return response.data;
          }),

          finalize(() => {
            this.addressAndShippingFormGroup.controls.address.enable();
          }),
        ),
      ),
    ),
  );

  private readonly _checkoutId = toSignal(
    this._checkoutIdSubject.pipe(
      switchMap(() =>
        this._activatedRoute.data.pipe(
          map(({ dataCheckoutId }) => {
            return dataCheckoutId.checkoutId;
          }),
        ),
      ),
    ),
  );

  private readonly _createOrderSubject = new Subject<
    CreateGuestOrderEc | CreateAuthUserOrderEc
  >();

  private readonly _createOrder = toSignal(
    this._createOrderSubject.pipe(
      tap(() => this.isCreateOrderProcess.set(true)),
      switchMap((model) =>
        model.paymentMethod === PaymentMethod.CashOnDelivery
          ? this._orderEcService.create(model).pipe(
              tap((response) =>
                this._router.navigate([response.id, 'summaries'], {
                  relativeTo: this._activatedRoute,
                }),
              ),
            )
          : this._orderEcService.create(model).pipe(
              tap(() => this.isWaitingForRedirection.set(true)),
              delay(3000),
              switchMap((response) =>
                this._orderEcService.getOrderStatus(response.id).pipe(
                  repeat({ delay: 2000 }),
                  filter(
                    (response) =>
                      response.data.status === OrderStatus.WaitingForPayment &&
                      !!response.data.redirectPaymentUri,
                  ),
                  take(1),
                  tap(
                    (response) =>
                      (window.location.href = response.data.redirectPaymentUri),
                  ),
                ),
              ),
              catchError((error) => {
                if (
                  error instanceof HttpErrorResponse &&
                  error.status === HttpStatusCode.BadRequest &&
                  (error.error.detail ===
                    'Your Shopping Cart changed after checkout.' ||
                    error.error.detail === "The ShoppingCart isn't verified.")
                ) {
                  return this._shoppingCartEcService.verifyShoppingCart().pipe(
                    tap(() => {
                      this.stepperIndex = 0;
                      this.isCreateOrderProcess.set(false);
                    }),
                  );
                }

                this.isCreateOrderProcess.set(false);
                return of(error);
              }),
            ),
      ),
    ),
  );

  readonly paymentFormControl = this._formBuilder.control(
    null as PaymentMethod | null,
    Validators.required,
  );

  readonly addressAndShippingFormGroup = this._formBuilder.group({
    email: this._formBuilder.control(
      null as string | undefined | null,
      CustomValidators.mapValidators(this.validatorParameters?.emailParams!),
    ),
    firstName: this._formBuilder.control(
      null as string | undefined | null,
      CustomValidators.mapValidators(
        this.validatorParameters?.firstNameParams!,
      ),
    ),
    lastName: this._formBuilder.control(
      null as string | undefined | null,
      CustomValidators.mapValidators(this.validatorParameters?.lastNameParams!),
    ),
    phoneNumber: this._formBuilder.control(
      null as string | undefined | null,
      CustomValidators.mapValidators(
        this.validatorParameters?.phoneNumberParams!,
      ),
    ),
    address: this._formBuilder.group({
      street: this._formBuilder.control(
        {
          value: null as string | null | undefined,
          disabled: this.hasCustomerPermission(),
        },
        CustomValidators.mapValidators(
          this.validatorParameters?.streetNameParams!,
        ),
      ),
      buildingNumber: this._formBuilder.control(
        {
          value: null as string | null | undefined,
          disabled: this.hasCustomerPermission(),
        },
        CustomValidators.mapValidators(
          this.validatorParameters?.buildingNumberParams!,
        ),
      ),
      apartmentNumber: this._formBuilder.control(
        {
          value: null as string | null | undefined,
          disabled: this.hasCustomerPermission(),
        },
        CustomValidators.mapValidators(
          this.validatorParameters?.apartmentNumberParams!,
        ),
      ),
      zipCode: this._formBuilder.control(
        {
          value: null as string | null | undefined,
          disabled: this.hasCustomerPermission(),
        },
        CustomValidators.mapValidators(
          this.validatorParameters?.zipCodeParams!,
        ),
      ),
      city: this._formBuilder.control(
        {
          value: null as string | null | undefined,
          disabled: this.hasCustomerPermission(),
        },
        CustomValidators.mapValidators(this.validatorParameters?.cityParams!),
      ),
      country: this._formBuilder.control(
        {
          value: null as string | null | undefined,
          disabled: this.hasCustomerPermission(),
        },
        CustomValidators.mapValidators(
          this.validatorParameters?.countryParams!,
        ),
      ),
    }),
    deliveryMethod: this._formBuilder.control(
      null as DeliveryMethod | null | undefined,
      Validators.required,
    ),
  });

  readonly summaryFormControl = this._formBuilder.control(
    null,
    Validators.requiredTrue,
  );

  readonly selectedUserAddress = toSignal(
    this.addressAndShippingFormGroup.controls.address.valueChanges.pipe(
      filter(() => this.hasCustomerPermission() && !!this.userAddresses()),
      map((form) => {
        const address = this.userAddresses()?.find(
          (x) =>
            x.streetName === form.street &&
            x.buildingNumber === form.buildingNumber &&
            x.apartmentNumber == form.apartmentNumber &&
            x.zipCode === form.zipCode &&
            x.city === form.city &&
            x.country === form.country,
        );

        return address ?? 'other';
      }),
    ),
  );

  ngOnInit(): void {
    this._eCommerceRouteService.currentRouteSection.set(
      ECommerceRouteSection.OrderStepper,
    );

    this._checkoutIdSubject.next();

    const currentUser = this._authService.currentUser();

    if (currentUser && this._authService.hasCustomerPermission()) {
      this.addressAndShippingFormGroup.controls.email.disable();
      this.addressAndShippingFormGroup.controls.firstName.disable();
      this.addressAndShippingFormGroup.controls.lastName.disable();

      this.addressAndShippingFormGroup.controls.email.setValue(
        currentUser.email,
      );
      this.addressAndShippingFormGroup.controls.firstName.setValue(
        currentUser.firstName,
      );
      this.addressAndShippingFormGroup.controls.lastName.setValue(
        currentUser.lastName,
      );

      if (currentUser.phoneNumber) {
        this.addressAndShippingFormGroup.controls.phoneNumber.setValue(
          currentUser.phoneNumber,
        );
      }
    }
  }

  ngOnDestroy(): void {
    this._eCommerceRouteService.currentRouteSection.set(undefined);
    this._shoppingCartEcService.isCheckoutProcess.set(false);
  }

  onStepSelectionChange(event: StepperSelectionEvent) {
    if (
      event.selectedIndex === 1 &&
      !this.userAddresses() &&
      this._authService.hasCustomerPermission()
    ) {
      this._loadUserAddressSubject.next();
    }
  }

  onStepInteracted(step: CdkStep) {
    step.stepControl.markAllAsTouched();
  }

  completeOrder() {
    if (!this.summaryFormControl.touched) {
      this.summaryFormControl.markAsTouched();
    }

    if (
      !this.summaryFormControl.valid ||
      !this.addressAndShippingFormGroup.valid ||
      !this.paymentFormControl.valid ||
      !this._checkoutId()
    ) {
      return;
    }

    const addressAndShippingFormValue = this.addressAndShippingFormGroup.value;
    const paymentFormControlValue = this.paymentFormControl.value;

    const model = this._authService.hasCustomerPermission()
      ? new CreateAuthUserOrderEc(
          this._checkoutId()!,
          addressAndShippingFormValue.phoneNumber!,
          addressAndShippingFormValue.address?.street!,
          addressAndShippingFormValue.address?.buildingNumber!,
          addressAndShippingFormValue.address?.zipCode!,
          addressAndShippingFormValue.address?.city!,
          addressAndShippingFormValue.address?.country!,
          addressAndShippingFormValue.deliveryMethod!,
          paymentFormControlValue!,
          addressAndShippingFormValue.address?.apartmentNumber!,
        )
      : new CreateGuestOrderEc(
          this._checkoutId(),
          addressAndShippingFormValue.email!,
          addressAndShippingFormValue.firstName!,
          addressAndShippingFormValue.lastName!,
          addressAndShippingFormValue.phoneNumber!,
          addressAndShippingFormValue.address?.street!,
          addressAndShippingFormValue.address?.buildingNumber!,
          addressAndShippingFormValue.address?.zipCode!,
          addressAndShippingFormValue.address?.city!,
          addressAndShippingFormValue.address?.country!,
          addressAndShippingFormValue.deliveryMethod!,
          paymentFormControlValue!,
          addressAndShippingFormValue.address?.apartmentNumber!,
        );

    this._createOrderSubject.next(model);
  }

  onSelectionUserAddressType(matSelectChange: MatSelectChange) {
    const value = matSelectChange.value;

    if (this.isUserAddressAc(value)) {
      this.setDeliveryAddressForm(value);
      return;
    }

    this.resetDeliveryAddressForm();
  }

  private setDeliveryAddressForm(value: UserAddressAc) {
    this.addressAndShippingFormGroup.controls.address.setValue({
      street: value.streetName,
      buildingNumber: value.buildingNumber,
      apartmentNumber: value.apartmentNumber,
      zipCode: value.zipCode,
      city: value.city,
      country: value.country,
    });
  }

  private resetDeliveryAddressForm() {
    this.addressAndShippingFormGroup.controls.address.reset();
  }

  private isUserAddressAc = (value: UserAddressAc): value is UserAddressAc =>
    !!value?.city;

  onSubmitErrorDialog() {
    this.shoppingCartChanges.set(undefined);
    this.addressAndShippingFormGroup.controls.deliveryMethod.setValue(null);
    this.paymentFormControl.setValue(null);
  }
}
