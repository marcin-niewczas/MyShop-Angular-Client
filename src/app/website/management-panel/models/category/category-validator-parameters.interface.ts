import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface CategoryValidatorParametersMp {
  readonly categoryNameParams: StringValidatorParameters;
  readonly categoryMaxLevel: number;
}
