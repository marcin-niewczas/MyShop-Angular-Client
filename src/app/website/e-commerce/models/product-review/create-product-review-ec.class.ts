export class CreateProductReviewEc {
  constructor(
    readonly productId: string,
    readonly rate: number,
    readonly review?: string | null,
  ) {}
}
