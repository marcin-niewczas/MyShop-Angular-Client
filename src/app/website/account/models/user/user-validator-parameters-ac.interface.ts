import { DateValidatorParameters } from '../../../../shared/models/validators/date-validator-parameters.interface';
import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface UserValidatorParametersAc {
  readonly firstNameParams: StringValidatorParameters;
  readonly lastNameParams: StringValidatorParameters;
  readonly phoneNumberParams: StringValidatorParameters;
  readonly dateOfBirthParams: DateValidatorParameters;
  readonly genderValues: readonly string[];
}
