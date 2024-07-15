import { Injectable, inject } from '@angular/core';
import { UserAddressAc } from '../models/user/user-address-ac.interface';
import { HttpClient } from '@angular/common/http';
import { UpdateUserAddressAc } from '../models/user/update-user-address-ac.class';
import { CreateUserAddressAc } from '../models/user/create-user-address-ac.class';
import { UserAddressValidatorParametersAc } from '../models/user/user-address-validator-parameters-ac.interface';
import { map } from 'rxjs';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { ValueData } from '../../../shared/models/value-data.interface';

@Injectable()
export class UserAddressAcService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);

  private readonly _baseUrl = `${this._enviromentService.apiAccountUrl}/users/addresses`;

  private _validatorParameters?: UserAddressValidatorParametersAc | undefined;
  get validatorParameters(): UserAddressValidatorParametersAc | undefined {
    return this._validatorParameters;
  }

  getValidatorParameters() {
    return this._client
      .get<
        ApiResponse<UserAddressValidatorParametersAc>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._validatorParameters = response.data;
          return response.data;
        }),
      );
  }

  get(id: string) {
    return this._client.get<ApiResponse<UserAddressAc>>(
      `${this._baseUrl}/${id}`,
    );
  }

  getAll() {
    return this._client.get<ApiResponse<UserAddressAc[]>>(this._baseUrl);
  }

  getUserAddresesCount() {
    return this._client
      .get<ApiResponse<ValueData<number>>>(`${this._baseUrl}/count`)
      .pipe(map((response) => response.data.value));
  }

  create(model: CreateUserAddressAc) {
    return this._client.post<ApiResponse<UserAddressAc>>(this._baseUrl, model);
  }

  update(model: UpdateUserAddressAc) {
    return this._client.put<ApiResponse<UserAddressAc>>(
      `${this._baseUrl}/${model.id}`,
      model,
    );
  }

  remove(id: string) {
    return this._client.delete(`${this._baseUrl}/${id}`);
  }
}
