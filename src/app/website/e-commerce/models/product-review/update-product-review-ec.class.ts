export class UpdateProductReviewEc {
  constructor(
    readonly id: string,
    readonly rate: number,
    readonly review?: string | null,
  ) {}
}
