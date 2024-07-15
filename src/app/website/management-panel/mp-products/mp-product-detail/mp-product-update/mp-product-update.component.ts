import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, zip, Subject, tap, switchMap } from 'rxjs';
import { BreadcrumbsComponent } from '../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../../shared/validators/custom-validator';
import { ProductMp } from '../../../models/product/product-mp.interface';
import { UpdateProductMp } from '../../../models/product/update-product-mp.interface';
import { ProductMpService } from '../../../services/product-mp.service';

@Component({
  selector: 'app-mp-product-update',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    LoadingComponent,
    RouterLink,
    MatSelectModule,
  ],
  templateUrl: './mp-product-update.component.html',
  styleUrl: './mp-product-update.component.scss',
})
export class MpProductUpdateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _productMpService = inject(ProductMpService);
  private readonly _router = inject(Router);
  private readonly _toastService = inject(ToastService);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Products', routerLink: '../../' },
  ];

  readonly validatorParameters = this._productMpService.validatorParameters;

  readonly updateProductFormGroup = this._formBuilder.group({
    modelName: this._formBuilder.control(
      null as string | null,
      CustomValidators.mapValidators(this.validatorParameters!.modelNameParams),
    ),
    displayProductType: this._formBuilder.control(
      null as string | null,
      Validators.required,
    ),
    description: this._formBuilder.control(
      null as string | null,
      CustomValidators.mapValidators(
        this.validatorParameters!.productDescriptionParams,
      ),
    ),
  });

  readonly product = toSignal(
    this._activatedRoute.data.pipe(
      map(({ product }) => {
        const data = product as ProductMp;
        this.breadcrumbsItems.push({ label: data.fullName, routerLink: '../' });
        this.breadcrumbsItems.push({ label: `Update - ${data.fullName}` });

        this.updateProductFormGroup.setValue({
          modelName: data.name,
          displayProductType: data.displayProductType,
          description: data.description ?? null,
        });
        return data;
      }),
    ),
  );

  readonly isUpdateProcess = signal(false);

  readonly somethingChange = toSignal(
    zip([
      this.updateProductFormGroup.valueChanges,
      this.updateProductFormGroup.statusChanges,
    ]).pipe(
      map(([value, status]) => {
        if (status === 'VALID') {
          const product = this.product();
          if (product) {
            if (
              value.displayProductType !== product.displayProductType ||
              value.modelName !== product.name ||
              value.description != product.description
            ) {
              return true;
            }
          }
        }

        return false;
      }),
    ),
  );

  private readonly _updateProductVariantSubject =
    new Subject<UpdateProductMp>();

  private readonly _updateOrderTask = toSignal(
    this._updateProductVariantSubject.pipe(
      tap(() => {
        this.isUpdateProcess.set(true);
        this.updateProductFormGroup.disable();
      }),
      switchMap((model) =>
        this._productMpService.updateProduct(model).pipe(
          tap(() => {
            this._router.navigate(['../'], {
              relativeTo: this._activatedRoute,
            });
            this._toastService.success('The Product has been updated.');
          }),
          catchHttpError(this._toastService, () => {
            this.isUpdateProcess.set(false);
            this.updateProductFormGroup.enable();
          }),
        ),
      ),
    ),
  );

  updateProduct() {
    if (!this.updateProductFormGroup.valid) {
      return;
    }

    const formValue = this.updateProductFormGroup.value;

    const model = new UpdateProductMp(
      this.product()?.id!,
      formValue.modelName!,
      formValue.displayProductType!,
      formValue.description === '' ? undefined : formValue.description,
    );

    this._updateProductVariantSubject.next(model);
  }
}
