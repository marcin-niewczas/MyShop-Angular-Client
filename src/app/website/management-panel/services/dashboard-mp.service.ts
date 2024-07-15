import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from '../../../../environments/environment.service';
import { PaginationQueryParams } from '../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { BaseDashboardElement } from '../models/dashboard/dashboard-mp';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DashboardMpService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilder = inject(UrlBuilderService);

  private readonly _baseUrl: string = `${this._enviromentService.apiManagementPanelUrl}/dashboards`;

  getPagedData(paginationQueryParam: PaginationQueryParams) {
    return this._client.get<ApiPagedResponse<BaseDashboardElement>>(
      this._urlBuilder.buildUrl(this._baseUrl, paginationQueryParam),
    );
  }
}
