import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, filter, map, switchMap, tap } from 'rxjs';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../shared/validators/custom-validator';
import { CreateUserAddressAc } from '../../models/user/create-user-address-ac.class';
import { UpdateUserAddressAc } from '../../models/user/update-user-address-ac.class';
import { UserAddressAc } from '../../models/user/user-address-ac.interface';
import { UserAddressAcService } from '../../services/user-address-ac.service';

export enum AccountAddressComponentType {
  Update = 'Update',
  Create = 'Create',
}

@Component({
  selector: 'app-account-address-create-update',
  standalone: true,
  imports: [
    MatInputModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    MatButtonModule,
    MatSlideToggleModule,
    RouterLink,
    BreadcrumbsComponent,
  ],
  templateUrl: './account-address-create-update.component.html',
  styleUrl: './account-address-create-update.component.scss',
})
export class AccountAddressCreateUpdateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _userAddressAcService = inject(UserAddressAcService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);

  readonly AccountAddressComponentType = AccountAddressComponentType;

  get validatorParameters() {
    return this._userAddressAcService.validatorParameters;
  }

  readonly userAddressFormGroup = this._formBuilder.group({
    streetName: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.streetNameParams!,
      ),
    ),
    buildingNumber: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.buildingNumberParams!,
      ),
    ),
    apartmentNumber: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.apartmentNumberParams!,
      ),
    ),
    city: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.cityParams!),
    ),
    zipCode: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.zipCodeParams!),
    ),
    country: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(this.validatorParameters?.countryParams!),
    ),
    userAddressName: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.userAddressNameParams!,
      ),
    ),
    isDefault: this._formBuilder.control(false, [Validators.required]),
  });

  private readonly _accountAddressComponentMode = signal<
    AccountAddressComponentType | undefined
  >(undefined);
  readonly accountAddressComponentMode =
    this._accountAddressComponentMode.asReadonly();

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Addresses', routerLink: '/account/addresses' },
  ];

  readonly userAddress = toSignal(
    this._activatedRoute.data.pipe(
      map((data) => {
        this._accountAddressComponentMode.set(data['mode']);
        const address = data['address'] as UserAddressAc;

        switch (this.accountAddressComponentMode()) {
          case AccountAddressComponentType.Update:
            this.breadcrumbsItems.push({
              label: `Update Address - ${address.userAddressName}`,
            });
            break;
          case AccountAddressComponentType.Create:
            this.breadcrumbsItems.push({ label: 'Create Address' });
            break;
        }

        if (
          this.accountAddressComponentMode() ===
          AccountAddressComponentType.Update
        ) {
          this.userAddressFormGroup.setValue({
            streetName: address.streetName,
            buildingNumber: address.buildingNumber,
            apartmentNumber: address.apartmentNumber ?? null,
            city: address.city,
            zipCode: address.zipCode,
            country: address.country,
            userAddressName: address.userAddressName,
            isDefault: address.isDefault,
          });
        }

        return address;
      }),
    ),
  );

  private readonly _createOrUpdateUserAddressSubject = new Subject<
    UpdateUserAddressAc | CreateUserAddressAc
  >();

  private readonly _createOrUpdateUserAddress = toSignal(
    this._createOrUpdateUserAddressSubject.pipe(
      tap(() => {
        this.isCreateUpdateProcess.set(true);
        this.userAddressFormGroup.disable();
      }),
      switchMap((model) =>
        model instanceof UpdateUserAddressAc
          ? this._userAddressAcService.update(model).pipe(
              tap(() => {
                this._toastService.success(
                  'The User Address has been updated.',
                );
                this._router.navigate(['../../'], {
                  relativeTo: this._activatedRoute,
                });
              }),
              catchHttpError(this._toastService, () => {
                this.isCreateUpdateProcess.set(false);
                this.userAddressFormGroup.enable();
              }),
            )
          : this._userAddressAcService.create(model).pipe(
              tap(() => {
                this._toastService.success(
                  'The User Address has been created.',
                );
                this._router.navigate(['../'], {
                  relativeTo: this._activatedRoute,
                });
              }),
              catchHttpError(this._toastService, () => {
                this.isCreateUpdateProcess.set(false);
                this.userAddressFormGroup.enable();
              }),
            ),
      ),
    ),
  );

  readonly canUpdate = toSignal(
    this.userAddressFormGroup.valueChanges.pipe(
      filter(
        () =>
          this.accountAddressComponentMode() ===
          AccountAddressComponentType.Update,
      ),
      map(
        (formValues) =>
          this.userAddress()?.streetName !== formValues.streetName ||
          this.userAddress()?.buildingNumber !== formValues.buildingNumber ||
          this.userAddress()?.apartmentNumber !== formValues.apartmentNumber ||
          this.userAddress()?.city !== formValues.city ||
          this.userAddress()?.zipCode !== formValues.zipCode ||
          this.userAddress()?.country !== formValues.country ||
          this.userAddress()?.userAddressName !== formValues.userAddressName ||
          this.userAddress()?.isDefault !== formValues.isDefault,
      ),
    ),
  );

  readonly isCreateUpdateProcess = signal(false);

  updateAddress() {
    if (!this.userAddressFormGroup.valid) {
      return;
    }

    const formValue = this.userAddressFormGroup.value;

    const model =
      this.accountAddressComponentMode() === AccountAddressComponentType.Update
        ? new UpdateUserAddressAc(
            this.userAddress()!.id,
            formValue.streetName!,
            formValue.buildingNumber!,
            formValue.city!,
            formValue.zipCode!,
            formValue.country!,
            formValue.userAddressName!,
            formValue.isDefault!,
            formValue.apartmentNumber,
          )
        : new CreateUserAddressAc(
            formValue.streetName!,
            formValue.buildingNumber!,
            formValue.city!,
            formValue.zipCode!,
            formValue.country!,
            formValue.userAddressName!,
            formValue.isDefault!,
            formValue.apartmentNumber,
          );

    this._createOrUpdateUserAddressSubject.next(model);
  }
}
