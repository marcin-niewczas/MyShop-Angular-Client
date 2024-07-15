import { ValuePosition } from '../../../../../shared/models/helpers/value-position.interface';

export class UpdatePositionsOfProductDetailOptionValuesMp {
  constructor(
    readonly productDetailOptionId: string,
    readonly positionsOfProductDetailOptionValues: ValuePosition<string>[],
  ) {}
}
