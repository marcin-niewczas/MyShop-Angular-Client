export class UpdateUserAc {
  constructor(
    readonly firstName: string,
    readonly lastName: string,
    readonly gender: string,
    readonly dateOfBirth: string,
    readonly phoneNumber?: string,
  ) {}
}
