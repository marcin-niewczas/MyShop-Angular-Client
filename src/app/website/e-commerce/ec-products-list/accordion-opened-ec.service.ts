import { Injectable } from '@angular/core';
import { ProductOptionEc } from '../models/product/product-filters-ec.interface';
import { ProductOptionSubtype } from '../../../shared/models/product-option/product-option-subtype.enum';
import { ParamMap } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { CurrentOptions } from './ec-product-list.resolver';

interface AccordionOpened {
  [key: string]: boolean;
}

@Injectable()
export class AccordionOpenedEcService {
  readonly accordionOpened: AccordionOpened = {
    sortBy: true,
  };

  get sortByAccordionOpened() {
    return this.accordionOpened['sortBy'];
  }

  get priceAccordionOpened() {
    return this.accordionOpened['price'];
  }

  get keys() {
    return Object.keys(this.accordionOpened);
  }

  toggle(key: string) {
    if (this.accordionOpened[key] != undefined) {
      this.accordionOpened[key] = !this.accordionOpened[key];
    }
  }

  toggleSortBy() {
    this.accordionOpened['sortBy'] = !this.accordionOpened['sortBy'];
  }

  togglePrice() {
    this.accordionOpened['price'] = !this.accordionOpened['price'];
  }

  setPriceAccordionOpened(queryParamMap: ParamMap) {
    this.accordionOpened['price'] =
      queryParamMap.keys.findIndex(
        (k) => k === 'MinPrice' || k === 'MaxPrice',
      ) !== -1;
  }

  setProductOptionAccordionsOpened(
    productOptions: ProductOptionEc[],
    currentOptions: CurrentOptions | undefined,
  ) {
    const keys = this.keys;

    if (currentOptions) {
      productOptions.forEach((option) => {
        if (!keys.includes(option.name)) {
          if (
            option.subtype === ProductOptionSubtype.Main ||
            currentOptions[option.name]
          ) {
            this.accordionOpened[option.name] = true;
          } else {
            this.accordionOpened[option.name] = false;
          }
        }
      });
    } else {
      productOptions.forEach((option) => {
        if (!keys.includes(option.name)) {
          if (option.subtype === ProductOptionSubtype.Main) {
            this.accordionOpened[option.name] = true;
          } else {
            this.accordionOpened[option.name] = false;
          }
        }
      });
    }
  }
}
