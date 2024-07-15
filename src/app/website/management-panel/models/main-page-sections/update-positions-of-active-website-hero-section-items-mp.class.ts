import { ValuePosition } from '../../../../shared/models/helpers/value-position.interface';

export class UpdatePositionsOfActiveWebsiteHeroSectionItemsMp {
  constructor(
    readonly websiteHeroSectionId: string,
    readonly idPositions: ValuePosition<string>[],
  ) {}
}
