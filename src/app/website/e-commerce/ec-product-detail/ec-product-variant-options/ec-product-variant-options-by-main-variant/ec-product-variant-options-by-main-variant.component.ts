import {
  Component,
  OnChanges,
  SimpleChanges,
  inject,
  input,
  model,
} from '@angular/core';
import { ProductDetailByMainVariantEc } from '../../../models/product/product-detail-ec.interface';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { ChosenProductVariant } from '../../ec-product-detail.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NgClass } from '@angular/common';
import { nameof } from '../../../../../shared/functions/helper-functions';
import { OptionNameValue } from '../../../../../shared/models/option-name-value.interface';

type VariantGroup = {
  name: FormControl<string>;
  value: FormControl<string | undefined>;
};

@Component({
  selector: 'app-ec-product-variant-options-by-main-variant',
  standalone: true,
  imports: [
    MatChipsModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
  ],
  templateUrl: './ec-product-variant-options-by-main-variant.component.html',
  styleUrl: '../ec-product-variant-options.component.scss',
})
export class EcProductVariantOptionsByMainVariantComponent
  implements OnChanges
{
  private readonly _formBuilder = inject(FormBuilder);

  readonly productDetail = input.required<ProductDetailByMainVariantEc>();
  readonly chosenProductVariant = model.required<
    ChosenProductVariant | undefined
  >();

  readonly variantsFormArray = this._formBuilder.array<FormGroup<VariantGroup>>(
    [],
  );

  variantStates: { [key: string]: { disabled: boolean; outOfStock: boolean } } =
    {};

  private readonly _variantsFormArrayChanges = toSignal(
    this.variantsFormArray.valueChanges.pipe(
      map((forms) => {
        const isValid = this.variantsFormArray.valid;

        if (!isValid && this.chosenProductVariant()) {
          this.chosenProductVariant.set(undefined);
        }

        const currentProductDetail = this.productDetail();

        if (forms.length == 1 && isValid) {
          const chosenVariant = currentProductDetail.currentVariants.find((x) =>
            x.variantValues.some(
              (v) => v.name === forms[0].name && v.value === forms[0].value,
            ),
          );

          if (chosenVariant) {
            this.chosenProductVariant.set({
              id: chosenVariant.id,
              lastItemsInStock: chosenVariant.lastItemsInStock,
              price: chosenVariant.price,
            } as ChosenProductVariant);
          }
        } else {
          const selectedNameValue = forms
            .filter((f) => f.value)
            .map((f) => <OptionNameValue>{ name: f.name, value: f.value });

          if (selectedNameValue.length <= 0) {
            const keys = Object.keys(this.variantStates);
            keys.forEach((k) => (this.variantStates[k].disabled = false));
          } else {
            currentProductDetail.availableOptions.forEach((option) => {
              const otherChosenOption = selectedNameValue.filter(
                (x) => x.name !== option.name,
              );

              if (otherChosenOption.length <= 0) {
                const keys = Object.keys(this.variantStates);
                keys
                  .filter((k) => k.startsWith(`${option.name}-`))
                  .forEach((k) => (this.variantStates[k].disabled = false));

                return;
              }

              option.variantValues.forEach((value) => {
                if (
                  selectedNameValue.some(
                    (x) => x.name === option.name && x.value === value,
                  )
                ) {
                  return;
                }

                if (
                  currentProductDetail.currentVariants.some(
                    (x) =>
                      otherChosenOption.every((o) =>
                        x.variantValues.some(
                          (vv) => vv.name === o.name && vv.value === o.value,
                        ),
                      ) &&
                      x.variantValues.some(
                        (vv) => vv.name === option.name && vv.value === value,
                      ),
                  )
                ) {
                  this.variantStates[`${option.name}-${value}`].disabled =
                    false;
                } else {
                  this.variantStates[`${option.name}-${value}`].disabled = true;
                }
              });
            });

            console.log(this.variantStates);
          }

          if (isValid) {
            const chosenProductVariant =
              currentProductDetail.currentVariants.find((x) =>
                x.variantValues.every((v) =>
                  selectedNameValue.some(
                    (s) => s.name === v.name && s.value === v.value,
                  ),
                ),
              );

            if (chosenProductVariant) {
              this.chosenProductVariant.set({
                id: chosenProductVariant.id,
                lastItemsInStock: chosenProductVariant.lastItemsInStock,
                price: chosenProductVariant.price,
                photos: chosenProductVariant.photos,
              });
            } else {
              this.chosenProductVariant.set(undefined);
            }
          }
        }
      }),
    ),
  );

  ngOnChanges(changes: SimpleChanges): void {
    const productDetailValue = changes[
      nameof<EcProductVariantOptionsByMainVariantComponent>('productDetail')
    ]?.currentValue as ProductDetailByMainVariantEc;

    if (productDetailValue) {
      this.variantsFormArray.clear({ emitEvent: false });
      this.variantStates = {};

      if (productDetailValue.availableOptions.length <= 0) {
        const chosenVariant = productDetailValue.currentVariants[0];
        this.chosenProductVariant.set({
          id: chosenVariant.id,
          lastItemsInStock: chosenVariant.lastItemsInStock,
          price: chosenVariant.price,
        } as ChosenProductVariant);
      } else if (productDetailValue.availableOptions.length === 1) {
        let tempNameValue: OptionNameValue;
        let tempOutOfStock = false;
        let isAnyInStock = false;

        productDetailValue.currentVariants.forEach((v) => {
          tempNameValue = v.variantValues[0];
          tempOutOfStock = v.lastItemsInStock == undefined;
          if (!tempOutOfStock) {
            isAnyInStock = true;
          }

          this.variantStates[`${tempNameValue.name}-${tempNameValue.value}`] = {
            disabled: false,
            outOfStock: tempOutOfStock,
          };
        });

        this.variantsFormArray.push(
          this._formBuilder.group({
            name: this._formBuilder.control(
              productDetailValue.availableOptions[0].name,
              [Validators.required],
            ),
            value: this._formBuilder.control(undefined as string | undefined, [
              Validators.required,
            ]),
          } as VariantGroup),
          { emitEvent: false },
        );

        if (!isAnyInStock) {
          this.chosenProductVariant.set({});
        }
      } else {
        productDetailValue.availableOptions.forEach((option) => {
          this.variantsFormArray.push(
            this._formBuilder.group({
              name: this._formBuilder.control(option.name, [
                Validators.required,
              ]),
              value: this._formBuilder.control(
                undefined as string | undefined,
                [Validators.required],
              ),
            } as VariantGroup),
            { emitEvent: false },
          );

          option.variantValues.forEach(
            (value) =>
              (this.variantStates[`${option.name}-${value}`] = {
                disabled: false,
                outOfStock: false,
              }),
          );
        });
      }
    }
  }
}
