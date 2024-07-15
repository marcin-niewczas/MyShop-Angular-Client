import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, map, switchMap, tap, zip } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BreadcrumbsComponent } from '../../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../../shared/helpers/pipe-helpers';
import { ToastService } from '../../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../../shared/validators/custom-validator';
import { ProductVariantMp } from '../../../models/product-variant/product-variant-mp.interface';
import { UpdateProductVariantMp } from '../../../models/product-variant/update-product-variant-mp.class';
import { ProductVariantMpService } from '../../../services/product-variant-mp.service';

@Component({
  selector: 'app-mp-product-variant-update',
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
  ],
  templateUrl: './mp-product-variant-update.component.html',
  styleUrl: './mp-product-variant-update.component.scss',
})
export class MpProductVariantUpdateComponent {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _productVariantMpService = inject(ProductVariantMpService);
  private readonly _router = inject(Router);
  private readonly _toastService = inject(ToastService);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Products', routerLink: '../../../../' },
  ];

  readonly validatorParameters =
    this._productVariantMpService.validatorParameters;

  readonly updateProductVariantFormGroup = this._formBuilder.group({
    quantity: this._formBuilder.control(
      null as number | undefined | null,
      CustomValidators.mapValidators(
        this._productVariantMpService.validatorParameters!
          .productVariantQuantityParams,
      ),
    ),
    price: this._formBuilder.control(
      null as number | undefined | null,
      CustomValidators.mapValidators(
        this._productVariantMpService.validatorParameters!.priceParams,
      ),
    ),
  });

  readonly productVariant = toSignal(
    this._activatedRoute.data.pipe(
      map(({ productVariant }) => {
        const data = productVariant as ProductVariantMp;
        this.breadcrumbsItems.push({
          label: data.productName,
          routerLink: '../../../',
        });
        this.breadcrumbsItems.push({
          label: `Update Variant - ${data.variantLabel}`,
        });

        this.updateProductVariantFormGroup.setValue({
          price: data.price,
          quantity: data.quantity,
        });
        return data;
      }),
    ),
  );

  readonly isUpdateProcess = signal(false);

  readonly somethingChange = toSignal(
    zip([
      this.updateProductVariantFormGroup.valueChanges,
      this.updateProductVariantFormGroup.statusChanges,
    ]).pipe(
      map(([value, status]) => {
        if (status === 'VALID') {
          const productVariant = this.productVariant();
          if (productVariant) {
            if (
              value.quantity !== productVariant.quantity ||
              value.price !== productVariant.price
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
    new Subject<UpdateProductVariantMp>();

  private readonly _updateOrderTask = toSignal(
    this._updateProductVariantSubject.pipe(
      tap(() => {
        this.isUpdateProcess.set(true);
        this.updateProductVariantFormGroup.disable();
      }),
      switchMap((model) =>
        this._productVariantMpService.update(model).pipe(
          tap(() => {
            this._router.navigate(['../../../'], {
              relativeTo: this._activatedRoute,
            });
            this._toastService.success('The Product Variant has been updated.');
          }),
          catchHttpError(this._toastService, () => {
            this.isUpdateProcess.set(false);
            this.updateProductVariantFormGroup.enable();
          }),
        ),
      ),
    ),
  );

  updateProductVariant() {
    if (!this.updateProductVariantFormGroup.valid) {
      return;
    }

    const formValue = this.updateProductVariantFormGroup.value;

    const model = new UpdateProductVariantMp(
      this.productVariant()?.id!,
      formValue.quantity!,
      formValue.price!,
    );

    this._updateProductVariantSubject.next(model);
  }
}
