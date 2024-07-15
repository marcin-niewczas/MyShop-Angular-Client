import { KeyValuePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, map, switchMap, tap, zip } from 'rxjs';
import { BreadcrumbsComponent } from '../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import { OrderStatus } from '../../../../../shared/models/responses/order/order-status.enum';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../../shared/validators/custom-validator';
import { OrderMp } from '../../../models/order/order-mp.interface';
import { UpdateOrderMp } from '../../../models/order/update-order-mp.interface';
import { OrderMpService } from '../../../services/order-mp.service';

@Component({
  selector: 'app-mp-order-update',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatButtonModule,
    RouterLink,
    MatIconModule,
    LoadingComponent,
    KeyValuePipe,
  ],
  templateUrl: './mp-order-update.component.html',
  styleUrl: './mp-order-update.component.scss',
})
export class MpOrderUpdateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _orderMpService = inject(OrderMpService);
  private readonly _router = inject(Router);
  private readonly _toastService = inject(ToastService);

  readonly isUpdateProcess = signal(false);

  readonly OrderStatus = OrderStatus;

  readonly updateOrderFormGroup = this._formBuilder.group({
    email: this._formBuilder.control(
      null as string | undefined | null,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.emailParams,
      ),
    ),
    firstName: this._formBuilder.control(
      null as string | undefined | null,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.firstNameParams,
      ),
    ),
    lastName: this._formBuilder.control(
      null as string | undefined | null,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.lastNameParams,
      ),
    ),
    phoneNumber: this._formBuilder.control(
      null as string | undefined | null,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.phoneNumberParams,
      ),
    ),
    streetName: this._formBuilder.control(
      null as string | null | undefined,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.streetNameParams,
      ),
    ),
    buildingNumber: this._formBuilder.control(
      null as string | null | undefined,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.buildingNumberParams,
      ),
    ),
    apartmentNumber: this._formBuilder.control(
      null as string | null | undefined,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.apartmentNumberParams,
      ),
    ),
    zipCode: this._formBuilder.control(
      null as string | null | undefined,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.zipCodeParams,
      ),
    ),
    city: this._formBuilder.control(
      null as string | null | undefined,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.cityParams,
      ),
    ),
    country: this._formBuilder.control(
      null as string | null | undefined,
      CustomValidators.mapValidators(
        this._orderMpService.validatorParameters!.countryParams,
      ),
    ),
    status: this._formBuilder.control(null as OrderStatus | null | undefined, [
      Validators.required,
    ]),
  });

  get validatorParameters() {
    return this._orderMpService.validatorParameters;
  }

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Orders', routerLink: '../../' },
  ];

  readonly order = toSignal(
    this._activatedRoute.data.pipe(
      map(({ order }) => {
        const data = order as OrderMp;
        this.breadcrumbsItems.push(
          { label: data.id, routerLink: '../' },
          { label: 'Update' },
        );

        this.updateOrderFormGroup.setValue({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          streetName: data.streetName,
          buildingNumber: data.buildingNumber,
          apartmentNumber: data.apartmentNumber,
          zipCode: data.zipCode,
          city: data.city,
          country: data.country,
          status: data.status,
        });

        return data;
      }),
    ),
  );

  readonly somethingChange = toSignal(
    zip([
      this.updateOrderFormGroup.valueChanges,
      this.updateOrderFormGroup.statusChanges,
    ]).pipe(
      map(([value, status]) => {
        if (status === 'VALID') {
          const order = this.order();
          if (order) {
            if (
              value.email !== order.email ||
              value.firstName !== order.firstName ||
              value.lastName !== order.lastName ||
              value.phoneNumber !== order.phoneNumber ||
              value.streetName !== order.streetName ||
              value.buildingNumber !== order.buildingNumber ||
              value.apartmentNumber !== order.apartmentNumber ||
              value.zipCode !== order.zipCode ||
              value.city !== order.city ||
              value.country !== order.country ||
              value.status !== order.status
            ) {
              return true;
            }
          }
        }

        return false;
      }),
    ),
  );

  private readonly _updateOrderSubject = new Subject<UpdateOrderMp>();

  private readonly _updateOrderTask = toSignal(
    this._updateOrderSubject.pipe(
      tap(() => {
        this.isUpdateProcess.set(true);
        this.updateOrderFormGroup.disable();
      }),
      switchMap((model) =>
        this._orderMpService.update(model).pipe(
          tap(() => {
            this._router.navigate(['../'], {
              relativeTo: this._activatedRoute,
            });
            this._toastService.success('The Order has been updated.');
          }),
          catchHttpError(this._toastService, () => {
            this.isUpdateProcess.set(false);
            this.updateOrderFormGroup.enable();
          }),
        ),
      ),
    ),
  );

  updateOrder() {
    if (!this.updateOrderFormGroup.valid) {
      return;
    }

    const formValue = this.updateOrderFormGroup.value;

    const model = new UpdateOrderMp(
      this.order()?.id!,
      formValue.email!,
      formValue.firstName!,
      formValue.lastName!,
      formValue.phoneNumber!,
      formValue.streetName!,
      formValue.buildingNumber!,
      formValue.zipCode!,
      formValue.city!,
      formValue.country!,
      formValue.status!,
      formValue.apartmentNumber,
    );

    this._updateOrderSubject.next(model);
  }
}
