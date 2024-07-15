import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { map, tap } from 'rxjs';
import { UpdateUserAc } from '../models/user/update-user-ac.class';
import { UpdateUserEmailAc } from '../models/user/update-user-email-ac.class';
import { UpdateUserPasswordAc } from '../models/user/update-user-password-ac.class';
import { PaginationQueryParams } from '../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { UserValidatorParametersAc } from '../models/user/user-validator-parameters-ac.interface';
import { SecurityValidatorParametersAc } from '../models/user/security-validator-parameters-ac.interface';
import { UserPhotoValidatorParametersAc } from '../models/user/user-photo-validator-parameters-ac.interface';
import { EnvironmentService } from '../../../../environments/environment.service';
import { User } from '../../../shared/models/responses/user/user.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { AuthService } from '../../authenticate/auth.service';
import { UserActiveDeviceAc } from '../models/user/user-active-device-ac.interface';

@Injectable()
export class UserAcService {
  private readonly _client = inject(HttpClient);
  private readonly _environment = inject(EnvironmentService);
  private readonly _urlBuilderService = inject(UrlBuilderService);
  private readonly _authService = inject(AuthService);

  private readonly _baseUrl = `${this._environment.apiAccountUrl}/users`;

  private _userValidatorParameters?: UserValidatorParametersAc | undefined;
  get userValidatorParameters(): UserValidatorParametersAc | undefined {
    return this._userValidatorParameters;
  }

  private _securityValidatorParameters?:
    | SecurityValidatorParametersAc
    | undefined;
  get securityValidatorParameters(): SecurityValidatorParametersAc | undefined {
    return this._securityValidatorParameters;
  }

  private _userPhotoValidatorParameters?:
    | UserPhotoValidatorParametersAc
    | undefined;
  get userPhotoValidatorParameters():
    | UserPhotoValidatorParametersAc
    | undefined {
    return this._userPhotoValidatorParameters;
  }

  getUserValidatorParameters() {
    return this._client
      .get<
        ApiResponse<UserValidatorParametersAc>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._userValidatorParameters = response.data;
          return response.data;
        }),
      );
  }

  getSecurityValidatorParameters() {
    return this._client
      .get<
        ApiResponse<SecurityValidatorParametersAc>
      >(`${this._baseUrl}/securites/validator-parameters`)
      .pipe(
        map((response) => {
          this._securityValidatorParameters = response.data;
          return response.data;
        }),
      );
  }

  getUserPhotoValidatorParameters() {
    return this._client
      .get<
        ApiResponse<UserPhotoValidatorParametersAc>
      >(`${this._baseUrl}/photos/validator-parameters`)
      .pipe(
        map((response) => {
          this._userPhotoValidatorParameters = response.data;
          return response.data;
        }),
      );
  }

  updateUser(model: UpdateUserAc) {
    return this._client
      .put<ApiResponse<User>>(`${`${this._baseUrl}`}`, model)
      .pipe(
        map((response) => {
          this._authService.updateUser(() => response.data);
          return response.data;
        }),
      );
  }

  getPagedActiveDevices(paginationQueryParam: PaginationQueryParams) {
    return this._client.get<ApiPagedResponse<UserActiveDeviceAc>>(
      this._urlBuilderService.buildUrl(
        `${this._baseUrl}/active-devices`,
        paginationQueryParam,
      ),
    );
  }

  updateUserEmail(model: UpdateUserEmailAc) {
    return this._client.patch(`${`${this._baseUrl}/e-mails`}`, model).pipe(
      tap(() =>
        this._authService.updateUser((value) => {
          if (value) {
            value.email = model.newEmail;
            return value;
          }

          return value;
        }),
      ),
    );
  }

  updateUserPassword(model: UpdateUserPasswordAc) {
    return this._client.patch(`${`${this._baseUrl}/passwords`}`, model);
  }

  updateUserPhoto(formData: FormData) {
    return this._client
      .patch<ApiResponse<User>>(`${`${this._baseUrl}/photos`}`, formData)
      .pipe(
        map((response) => {
          this._authService.updateUser(() => response.data);

          return response.data;
        }),
      );
  }

  removeUserPhoto() {
    return this._client
      .delete<ApiResponse<User>>(`${`${this._baseUrl}/photos`}`)
      .pipe(
        map((response) => {
          this._authService.updateUser(() => response.data);

          return response.data;
        }),
      );
  }
}
