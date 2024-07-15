import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface UserAddressValidatorParametersAc {
  readonly userAddressNameParams: StringValidatorParameters;
  readonly streetNameParams: StringValidatorParameters;
  readonly buildingNumberParams: StringValidatorParameters;
  readonly apartmentNumberParams: StringValidatorParameters;
  readonly cityParams: StringValidatorParameters;
  readonly zipCodeParams: StringValidatorParameters;
  readonly countryParams: StringValidatorParameters;
  readonly maxCountUserAddresses: number;
}
