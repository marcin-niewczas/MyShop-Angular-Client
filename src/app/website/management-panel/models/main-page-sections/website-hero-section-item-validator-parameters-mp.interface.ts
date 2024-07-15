import { PhotoValidatorParameters } from '../../../../shared/models/validators/photo-validator-parameters.interface';
import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface WebsiteHeroSectionItemValidatorParametersMp {
  readonly titleParams: StringValidatorParameters;
  readonly subtitleParams: StringValidatorParameters;
  readonly routerLinkParams: StringValidatorParameters;
  readonly photoParams: PhotoValidatorParameters;
  readonly maxPosition: number;
  readonly maxItemsInWebsiteHeroSection: number;
}
