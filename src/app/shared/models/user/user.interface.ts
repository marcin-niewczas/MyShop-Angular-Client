import { EmployeeRole } from '../../../website/authenticate/models/employee-role.enum';
import { UserRole } from './user-role.enum';

export interface User {
  readonly firstName: string;
  readonly lastName: string;
  email: string;
  readonly gender: string;
  readonly dateOfBirth: Date;
  readonly userRole: UserRole;
  readonly phoneNumber?: string;
  readonly photoUrl?: string;
  readonly employeeRole: EmployeeRole;
}
