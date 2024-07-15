import { ValuePosition } from '../../../../../shared/models/helpers/value-position.interface';

export class UpdatePositionsOfProductVariantOptionValuesMp {
  constructor(
    readonly productVariantOptionId: string,
    readonly positionsOfProductVariantOptionValues: ValuePosition<string>[],
  ) {}
}
