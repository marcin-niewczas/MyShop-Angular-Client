import {
  Component,
  OnChanges,
  SimpleChanges,
  input,
  model,
  signal,
} from '@angular/core';
import { ProductDetailByAllVariantsEc } from '../../../models/product/product-detail-ec.interface';
import { MatChipsModule } from '@angular/material/chips';
import { RouterLink } from '@angular/router';
import { ChosenProductVariant } from '../../ec-product-detail.component';
import { MatRippleModule } from '@angular/material/core';
import { OptionNameValue } from '../../../../../shared/models/option-name-value.interface';

type ValueByAllVariants = {
  value: string;
  disabled: boolean;
  selected: boolean;
  url?: string;
  defaultUrl: string;
};
type OptionByAllVariants = { name: string; values: ValueByAllVariants[] };

@Component({
  selector: 'app-ec-product-variant-options-by-all-variants',
  standalone: true,
  imports: [MatChipsModule, RouterLink, MatRippleModule],
  templateUrl: './ec-product-variant-options-by-all-variants.component.html',
  styleUrl: '../ec-product-variant-options.component.scss',
})
export class EcProductVariantOptionsByAllVariantsComponent
  implements OnChanges
{
  readonly productDetail = input.required<ProductDetailByAllVariantsEc>();

  readonly optionsByAllVariants = signal<OptionByAllVariants[] | undefined>(
    undefined,
  );
  readonly chosenProductVariant = model.required<
    ChosenProductVariant | undefined
  >();

  ngOnChanges(changes: SimpleChanges): void {
    const productDetailValue = changes['productDetail']
      ?.currentValue as ProductDetailByAllVariantsEc;

    if (productDetailValue) {
      let tempOptionsByAllVariants: OptionByAllVariants[] = [];
      let tempOptionByAllVariants: OptionByAllVariants;
      let tempUrl: string | undefined;
      let tempOptionsWithoutCurrent: OptionNameValue[];

      productDetailValue.availableOptions.forEach((option) => {
        tempOptionByAllVariants = { name: option.name, values: [] };

        option.variantValues.forEach((value) => {
          tempOptionsWithoutCurrent =
            productDetailValue.allCurrentVariantOptions.filter(
              (o) => o.name !== option.name && o.value !== value.value,
            );

          tempUrl = productDetailValue.allVariants.find(
            (x) =>
              tempOptionsWithoutCurrent.every((t) =>
                x.value.some((v) => v.name === t.name && v.value === t.value),
              ) &&
              x.value.some(
                (v) => v.name === option.name && v.value === value.value,
              ),
          )?.encodedName;

          tempOptionByAllVariants.values.push({
            value: value.value,
            selected:
              productDetailValue.allCurrentVariantOptions.findIndex(
                (x) => x.name === option.name && x.value === value.value,
              ) !== -1,
            disabled: !tempUrl,
            url: tempUrl,
            defaultUrl: value.encodedName,
          });
        });

        tempOptionsByAllVariants.push(tempOptionByAllVariants);
      });

      this.optionsByAllVariants.set(tempOptionsByAllVariants);
      this.chosenProductVariant.set({
        id: productDetailValue.productVariantId,
        lastItemsInStock: productDetailValue.lastItemsInStock,
        price: productDetailValue.price,
      });
    }
  }
}
