export class CreateCategoryMp {
  constructor(
    readonly name: string,
    readonly parentCategoryId?: string,
  ) {}
}
