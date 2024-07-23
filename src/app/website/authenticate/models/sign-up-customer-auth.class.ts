import { Gender } from '../../../shared/models/user/gender.enum';

export class SignUpCustomerAuth {
  constructor(
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    readonly password: string,
    readonly confirmPassword: string,
    readonly gender: Gender,
    readonly dateOfBirth: string,
    readonly phoneNumber?: string,
  ) {}
}
