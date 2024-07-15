import { ValuePosition } from '../../../../shared/models/helpers/value-position.interface';

export class UpdateProductOptionsPositionsOfProductMp {
  constructor(
    readonly productId: string,
    readonly idPositions: ValuePosition<string>[],
  ) {}
}
