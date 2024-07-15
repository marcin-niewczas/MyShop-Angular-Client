import { StringValidatorParameters } from '../../../../shared/models/validators/string-validator-parameters.interface';

export interface MainPageSectionValidatorParametersMp {
  readonly websiteHeroSectionLabelParams: StringValidatorParameters;
  readonly productsCarouselSectionTypes: readonly string[];
  readonly websiteHeroSectionDisplayTypes: readonly string[];
  readonly maxActivatedItemsInWebsiteHeroSection: number;
  readonly maxMainPageSections: number;
}
