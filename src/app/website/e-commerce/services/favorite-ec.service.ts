import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { ValueData } from '../../../shared/models/value-data.interface';

@Injectable()
export class FavoriteEcService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);

  private readonly _baseUrl = `${this._enviromentService.apiEcommerceUrl}/favorites`;

  getStatusOfFavorite(productEncodedName: string) {
    return this._client.get<ApiResponse<ValueData<boolean>>>(
      `${this._baseUrl}/${productEncodedName}/status`,
    );
  }

  getStatusOfFavorites(productEncodedNames: string[]) {
    return this._client.get<ApiResponse<Record<string, boolean>>>(
      `${this._baseUrl}/status?productEncodedNames=[${productEncodedNames.join(',')}]`,
    );
  }
}
