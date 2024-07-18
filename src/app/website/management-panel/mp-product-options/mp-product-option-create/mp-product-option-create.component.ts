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
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, switchMap, tap } from 'rxjs';
import {
  inAnimation,
  slideFromRightAnimation,
  slideFromLeftAnimation,
} from '../../../../shared/components/animations';
import { BreadcrumbsComponent } from '../../../../shared/components/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsItems } from '../../../../shared/components/breadcrumbs/breadcrumbs.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { catchHttpError } from '../../../../shared/helpers/pipe-helpers';
import { ProductOptionSortType } from '../../../../shared/models/product-option/product-option-sort-type.enum';
import { ProductOptionSubtype } from '../../../../shared/models/product-option/product-option-subtype.enum';
import { ProductOptionType } from '../../../../shared/models/product-option/product-option-type.enum';
import { ToastService } from '../../../../shared/services/toast.service';
import { CustomValidators } from '../../../../shared/validators/custom-validator';
import { CreateProductDetailOptionMp } from '../../models/product-option/details/create-product-detail-option-mp.class';
import { CreateProductVariantOptionMp } from '../../models/product-option/variants/create-product-variant-option-mp.class';
import { ProductOptionMpService } from '../../services/product-option-mp.service';
import { getProductOptionTypeDescription } from '../../helpers/management-panel-helper-functions';

@Component({
  selector: 'app-mp-product-option-create',
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    MatTooltipModule,
  ],
  templateUrl: './mp-product-option-create.component.html',
  styleUrl: './mp-product-option-create.component.scss',
  animations: [inAnimation, slideFromRightAnimation, slideFromLeftAnimation],
})
export class MpProductOptionCreateComponent {
  private readonly _formBuilder = inject(FormBuilder);
  private readonly _productOptionMpService = inject(ProductOptionMpService);
  private readonly _router = inject(Router);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _toastService = inject(ToastService);

  readonly breadcrumbsItems: BreadcrumbsItems = [
    { label: 'Product Options', routerLink: '../' },
    { label: 'Create Product Option' },
  ];

  get validatorParameters() {
    return this._productOptionMpService.validatorParameters;
  }

  readonly formGroup = this._formBuilder.group({
    name: this._formBuilder.control(
      '',
      CustomValidators.mapValidators(
        this.validatorParameters?.productOptionNameParams!,
      ),
    ),
    productOptionType: this._formBuilder.control('', Validators.required),
    productOptionSubtype: this._formBuilder.control('', Validators.required),
    productOptionSortType: this._formBuilder.control('', Validators.required),
    productOptionValues: this._formBuilder.array([]),
  });

  readonly ProductOptionType = ProductOptionType;
  readonly ProductOptionSubtype = ProductOptionSubtype;
  readonly ProductOptionSortType = ProductOptionSortType;

  readonly getProductOptionTypeDescription = getProductOptionTypeDescription;

  readonly isCreateProcess = signal(false);

  private readonly _createProductOptionSubject = new Subject<
    CreateProductDetailOptionMp | CreateProductVariantOptionMp
  >();

  private readonly _createProductOptionTask = toSignal(
    this._createProductOptionSubject.pipe(
      switchMap((model) =>
        this._productOptionMpService.create(model).pipe(
          tap((response) => {
            this._toastService.success('Product Options has been created.');
            this._router.navigate(['../', response.id], {
              relativeTo: this._activatedRoute,
            });
          }),
          catchHttpError(this._toastService, () => {
            this.isCreateProcess.set(false);
            this.formGroup.enable();
          }),
        ),
      ),
    ),
  );

  addOptionValueControl() {
    this.formGroup.controls.productOptionValues.push(
      this._formBuilder.control(
        '',
        CustomValidators.mapValidators(
          this.validatorParameters?.productOptionValueParams!,
        ),
      ),
    );
  }

  removeOptionValueControl(index: number) {
    this.formGroup.controls.productOptionValues.removeAt(index);
  }

  create() {
    if (!this.formGroup.valid) {
      return;
    }

    this.isCreateProcess.set(true);
    this.formGroup.disable();

    const formValue = this.formGroup.value;

    let model: CreateProductDetailOptionMp | CreateProductVariantOptionMp;

    switch (formValue.productOptionType as ProductOptionType) {
      case ProductOptionType.Variant:
        model = new CreateProductVariantOptionMp(
          formValue.name!,
          formValue.productOptionSubtype as ProductOptionSubtype,
          formValue.productOptionSortType as ProductOptionSortType,
          formValue.productOptionValues as string[],
        );
        break;
      case ProductOptionType.Detail:
        model = new CreateProductDetailOptionMp(
          formValue.name!,
          formValue.productOptionSubtype as ProductOptionSubtype,
          formValue.productOptionSortType as ProductOptionSortType,
          formValue.productOptionValues as string[],
        );
        break;
      default:
        throw new Error(
          `Not implemented for ProductOptionType equals '${formValue.productOptionType}'.`,
        );
    }

    this._createProductOptionSubject.next(model);
  }
}
