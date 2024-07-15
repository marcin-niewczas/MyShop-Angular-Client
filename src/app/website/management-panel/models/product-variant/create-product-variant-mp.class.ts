import { ValuePosition } from '../../../../shared/models/helpers/value-position.interface';

export class CreateProductVariantMp {
  constructor(
    readonly quantity: number,
    readonly price: number,
    readonly productId: string,
    readonly productVariantOptionValueIds: string[],
    readonly photosIdPositions: ValuePosition<string>[] | undefined,
  ) {}
}
