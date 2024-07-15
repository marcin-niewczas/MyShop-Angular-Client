import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface ProductValidatorParametersMp {
    readonly modelNameParams: StringValidatorParameters;
    readonly productDescriptionParams: StringValidatorParameters;
    readonly allowedDisplayProductTypes: readonly string[];
  }