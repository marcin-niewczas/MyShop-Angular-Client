import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface OrderValidatorParametersEc {
  readonly emailParams: StringValidatorParameters;
  readonly firstNameParams: StringValidatorParameters;
  readonly lastNameParams: StringValidatorParameters;
  readonly phoneNumberParams: StringValidatorParameters;
  readonly streetNameParams: StringValidatorParameters;
  readonly buildingNumberParams: StringValidatorParameters;
  readonly apartmentNumberParams: StringValidatorParameters;
  readonly cityParams: StringValidatorParameters;
  readonly zipCodeParams: StringValidatorParameters;
  readonly countryParams: StringValidatorParameters;
  readonly allowedPaymentMethods: readonly string[];
  readonly allowedDeliveryMethods: readonly string[];
}
