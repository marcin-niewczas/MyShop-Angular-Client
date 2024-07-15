import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmployeeRole } from './models/employee-role.enum';
import { TokenStorageService } from './token-storage.service';
import { EnvironmentService } from '../../../environments/environment.service';
import { User } from '../../shared/models/responses/user/user.interface';
import { AuthTokenState } from './models/auth-token-state.enum';
import { AuthValidatorParameters } from './models/auth-validator-parameters.interface';
import { ApiResponse } from '../../shared/models/responses/api-response.interface';
import { SignInAuth } from './models/sign-in-auth.class';
import { Auth } from './models/auth.interface';
import { SignUpCustomerAuth } from './models/sign-up-customer-auth.class';
import { UserRole } from '../../shared/models/responses/user/user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _tokenStorageService = inject(TokenStorageService);

  private readonly _baseUrl = `${this._enviromentService.apiAuthenticateUrl}`;
  private _refreshingTokenInProgress = false;
  private _refreshingTokenInProgressSubject = new BehaviorSubject<string | undefined>(undefined);
  readonly refrereshingTokenInProgress$ = this._refreshingTokenInProgressSubject.asObservable();

  private readonly _currentUser = signal<User | undefined>(undefined);
  readonly currentUser = this._currentUser.asReadonly();

  private readonly _hasGuestPermission = signal(false);
  readonly hasGuestPermission = this._hasGuestPermission.asReadonly();

  private readonly _hasCustomerPermission = signal(false);
  readonly hasCustomerPermission = this._hasCustomerPermission.asReadonly();

  private readonly _hasEmployeePermission = signal(false);
  readonly hasEmployeePermission = this._hasEmployeePermission.asReadonly();

  private readonly _hasEmployeeSellerPermission = signal(false);
  readonly hasEmployeeSellerPermission = this._hasEmployeeSellerPermission.asReadonly();

  private readonly _hasEmployeeManagerPermission = signal(false);
  readonly hasEmployeeManagerPermission = this._hasEmployeeManagerPermission.asReadonly();

  private readonly _hasEmployeeAdminPermission = signal(false);
  readonly hasEmployeeAdminPermission = this._hasEmployeeAdminPermission.asReadonly();

  private readonly _hasEmployeeSuperAdminPermission = signal(false);
  readonly hasEmployeeSuperAdminPermission = this._hasEmployeeSuperAdminPermission.asReadonly();

  get refreshingTokenInProgress() {
    return this._refreshingTokenInProgress;
  }

  get authTokenState() {
    if (this._refreshingTokenInProgress) {
      return AuthTokenState.RefreshTokenInProgress;
    }

    const accessToken = this._tokenStorageService.accessToken;
    const refreshToken = this._tokenStorageService.refreshToken;
    const expiryAccessTokenDate = this._tokenStorageService.expiryAccessTokenDate;
    const expiryRefreshTokenDate = this._tokenStorageService.expiryRefreshTokenDate;

    if (!accessToken && !refreshToken && !expiryAccessTokenDate && !expiryRefreshTokenDate) {
      return AuthTokenState.NoAuthenticate;
    }

    const now = new Date();

    now.setSeconds(now.getSeconds() + 2);

    if (
      !accessToken ||
      !refreshToken ||
      !expiryAccessTokenDate ||
      !expiryRefreshTokenDate ||
      (expiryAccessTokenDate <= now && expiryRefreshTokenDate <= now)
    ) {
      return AuthTokenState.CannotRefresh;
    }

    if (expiryAccessTokenDate <= now && expiryRefreshTokenDate > now) {
      return AuthTokenState.NeedRefresh;
    }

    return AuthTokenState.Ok;
  }

  get isAuthenticated() {
    const accessToken = this._tokenStorageService.accessToken;
    const refreshToken = this._tokenStorageService.refreshToken;
    const expiryAccessTokenDate = this._tokenStorageService.expiryAccessTokenDate;
    const expiryRefreshTokenDate = this._tokenStorageService.expiryRefreshTokenDate;

    return (
      accessToken !== null &&
      refreshToken !== null &&
      expiryAccessTokenDate !== null &&
      expiryRefreshTokenDate !== null &&
      expiryRefreshTokenDate > new Date()
    );
  }

  private _validatorParameters?: AuthValidatorParameters | undefined;
  get validatorParameters(): AuthValidatorParameters | undefined {
    return this._validatorParameters;
  }

  getValidatorParameters() {
    return this._client
      .get<ApiResponse<AuthValidatorParameters>>(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._validatorParameters = response.data;
          return response.data;
        }),
      );
  }

  getUserMe() {
    return this._client.get<ApiResponse<User>>(`${this._baseUrl}/users/me`).pipe(
      map((response) => {
        this._currentUser.set(response.data);

        switch (response.data.userRole) {
          case UserRole.Guest: {
            this.setGuestRole();
            break;
          }
          case UserRole.Customer: {
            this.setCustomerRole();
            break;
          }
          case UserRole.Employee: {
            this.setEmployeeRole(response.data.employeeRole);
            break;
          }
        }

        return response.data;
      }),
    );
  }

  signIn(model: SignInAuth) {
    return this._client
      .post<ApiResponse<Auth>>(`${this._baseUrl}/sign-in`, model)
      .pipe(tap((response) => this._tokenStorageService.saveData(response.data)));
  }

  signUpGuest() {
    return this._client.post<ApiResponse<Auth>>(`${this._baseUrl}/guests/sign-up`, {}).pipe(
      tap((response) => {
        this.setGuestRole();
        this._tokenStorageService.saveData(response.data);
      }),
    );
  }

  signUpCustomer(model: SignUpCustomerAuth) {
    return this._client.post(`${this._baseUrl}/customers/sign-up`, model);
  }

  logout() {
    return this._client.post(`${this._baseUrl}/users/me/logout`, null).pipe(
      tap(() => {
        this._tokenStorageService.clearData();
        document.location.href = '/';
      }),
    );
  }

  refreshAccessToken() {
    this._refreshingTokenInProgressSubject.next(undefined);
    this._refreshingTokenInProgress = true;
    this._refreshAccessTokenSubject.next();
  }

  private readonly _refreshAccessTokenSubject = new Subject<void>();

  private readonly _refreshAccessToken = toSignal(
    this._refreshAccessTokenSubject.pipe(
      switchMap(() =>
        this._client
          .post<ApiResponse<Auth>>(`${this._baseUrl}/refresh-access-token`, {
            refreshToken: this._tokenStorageService.refreshToken,
            userTokenId: this._tokenStorageService.userTokenId,
          })
          .pipe(
            tap((response) => {
              this._tokenStorageService.saveData(response.data);
              this._refreshingTokenInProgressSubject.next(response.data.accessToken);
            }),
            catchError((error) => {
              return of(error);
            }),
            finalize(() => {
              this._refreshingTokenInProgress = false;
            }),
          ),
      ),
    ),
  );

  updateUser(updateFn: (value: User | undefined) => typeof value) {
    this._currentUser.update(updateFn);
  }

  private setGuestRole() {
    this._hasGuestPermission.set(true);
    this._hasCustomerPermission.set(false);
    this._hasEmployeePermission.set(false);
  }

  private setCustomerRole() {
    this._hasGuestPermission.set(true);
    this._hasCustomerPermission.set(true);
    this._hasEmployeePermission.set(false);
  }

  private setEmployeeRole(subrole: EmployeeRole) {
    this._hasGuestPermission.set(true);
    this._hasCustomerPermission.set(true);
    this._hasEmployeePermission.set(true);

    switch (subrole) {
      case EmployeeRole.Seller: {
        this._hasEmployeeSellerPermission.set(true);
        this._hasEmployeeManagerPermission.set(false);
        this._hasEmployeeAdminPermission.set(false);
        this._hasEmployeeSuperAdminPermission.set(false);
        break;
      }
      case EmployeeRole.Manager: {
        this._hasEmployeeSellerPermission.set(true);
        this._hasEmployeeManagerPermission.set(true);
        this._hasEmployeeAdminPermission.set(false);
        this._hasEmployeeSuperAdminPermission.set(false);
        break;
      }
      case EmployeeRole.Admin: {
        this._hasEmployeeSellerPermission.set(true);
        this._hasEmployeeManagerPermission.set(true);
        this._hasEmployeeAdminPermission.set(true);
        this._hasEmployeeSuperAdminPermission.set(false);
        break;
      }
      case EmployeeRole.SuperAdmin: {
        this._hasEmployeeSellerPermission.set(true);
        this._hasEmployeeManagerPermission.set(true);
        this._hasEmployeeAdminPermission.set(true);
        this._hasEmployeeSuperAdminPermission.set(true);
        break;
      }
    }
  }
}