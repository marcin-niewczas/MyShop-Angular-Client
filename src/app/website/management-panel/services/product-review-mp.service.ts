import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from '../../../../environments/environment.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProductReviewMpService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);

  private readonly _baseUrl: string = `${this._enviromentService.apiManagementPanelUrl}/product-reviews`;

  remove(id: string) {
    return this._client.delete(`${this._baseUrl}/${id}`);
  }
}
