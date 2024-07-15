export class UpdateUserEmailAc {
  constructor(
    readonly newEmail: string,
    readonly password: string,
  ) {}
}
