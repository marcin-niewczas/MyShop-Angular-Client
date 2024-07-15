import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface ProductOptionValidatorParametersMp {
  readonly productOptionNameParams: StringValidatorParameters;
  readonly productOptionValueParams: StringValidatorParameters;
  readonly allowedProductOptionTypes: readonly string[];
  readonly allowedProductOptionSubtypes: readonly string[];
  readonly allowedProductOptionSortTypes: readonly string[];
}
