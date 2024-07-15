import { ValuePosition } from '../../../../shared/models/helpers/value-position.interface';

export class CreateProductVariantPhotoItemsMp {
  constructor(
    readonly id: string,
    readonly idPositions: ValuePosition<string>[],
  ) {}
}
