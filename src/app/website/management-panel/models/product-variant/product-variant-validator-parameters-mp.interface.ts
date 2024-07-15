import { PhotoValidatorParameters } from '../../../../shared/models/validators/photo-validator-parameters.interface';
import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface ProductVariantValidatorParametersMp {
  readonly productVariantQuantityParams: StringValidatorParameters;
  readonly priceParams: StringValidatorParameters;
  readonly photoParams: PhotoValidatorParameters;
  readonly maxPhotos: number;
}
