export class UpdateProductMp {
  constructor(
    readonly id: string,
    readonly productName: string,
    readonly displayProductType: string,
    readonly description: string | undefined | null,
  ) {}
}
