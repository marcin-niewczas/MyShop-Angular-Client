import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface ProductReviewValidatorParametersEc {
  readonly productReviewTextParams: StringValidatorParameters;
  readonly minProductReviewRank: number;
  readonly maxProductReviewRank: number;
}
