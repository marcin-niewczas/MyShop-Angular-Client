import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface SecurityValidatorParametersAc {
  readonly emailParams: StringValidatorParameters;
  readonly passwordParams: StringValidatorParameters;
}
