import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { SharedApiConfiguration } from '../models/responses/api-configuration/shared-api-configuration.interface';
import { ApiResponse } from '../models/responses/api-response.interface';
import { EnvironmentService } from '../../../environments/environment.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  apiConfiguration!: SharedApiConfiguration;

  constructor(
    private _enviromentService: EnvironmentService,
    private _client: HttpClient,
  ) {}

  healthCheck() {
    return this._client.get(`${this._enviromentService.apiHealthCheckUrl}`, {responseType: 'text'});
  }
  
  getSharedConfiguration() {
    return this._client
      .get<ApiResponse<SharedApiConfiguration>>(`${this._enviromentService.apiConfigurationUrl}/shared`)
      .pipe(map((response) => (this.apiConfiguration = response.data)));
  }
}