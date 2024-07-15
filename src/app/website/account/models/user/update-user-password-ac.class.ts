export class UpdateUserPasswordAc {
  constructor(
    readonly password: string,
    readonly newPassword: string,
    readonly confirmNewPassword: string,
    readonly logoutOtherDevices: boolean,
  ) {}
}
