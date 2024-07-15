import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { StringValidatorParameters } from '../models/validators/string-validator-parameters.interface';

export class CustomValidators {
  static nullOrWhitespace(control: AbstractControl): ValidationErrors | null {
    return control.value != null && control.value.trim() !== '' ? null : { nullOrWhitespace: 'Required' };
  }

  static whitespace(control: AbstractControl): ValidationErrors | null {
    return control.value == null || control.value === '' || control.value.toString().trim() !== ''
      ? null
      : { whitespace: 'Value contains only whitespace letter' };
  }

  static quantity(control: AbstractControl): ValidationErrors | null {
    if (control.value != null && Number.isInteger(control.value) && control.value >= 0) {
      return null;
    }

    return { naturalNumber: 'Value must be in whole numbers' };
  }

  static price(control: AbstractControl): ValidationErrors | null {
    if (control.value != null && /^[0-9]+(\.[0-9]{1,2})?$/.test(control.value.toString())) {
      return null;
    }

    return { price: 'Wrong price format' };
  }

  static regex(pattern: string, errorMessage?: string): ValidatorFn {
    return function regexFunc(control: AbstractControl): ValidationErrors | null {
      if (control.value == null || new RegExp(pattern).test(control.value.toString())) {
        return null;
      }

      return { pattern: errorMessage ?? 'Wrong format' };
    };
  }

  static equalsTo(toField: string): ValidatorFn {
    return function equalsToFunc(control: AbstractControl): ValidationErrors | null {     
      const toFieldControl = control.parent?.get(toField);

      if (!toFieldControl) {
        return null;
      }

      if (control.value !== toFieldControl.value) {
        return { equalsTo: 'Not equals' };
      }

      return null;
    };
  }

  static mapValidators(validatorParameters: StringValidatorParameters) {
    const validatorFnArray: ValidatorFn[] = [];

    if (validatorParameters.minLength != undefined) {
      validatorFnArray.push(Validators.minLength(validatorParameters.minLength));
    }

    if (validatorParameters.maxLength != undefined) {
      validatorFnArray.push(Validators.maxLength(validatorParameters.maxLength));
    }

    if (validatorParameters.isRequired) {
      validatorFnArray.push(Validators.required, CustomValidators.whitespace);
    } else {
      validatorFnArray.push(CustomValidators.whitespace);
    }

    if (validatorParameters.regexPattern) {
      validatorFnArray.push(CustomValidators.regex(validatorParameters.regexPattern, validatorParameters.errorMessage));
    }

    return validatorFnArray;
  }
}