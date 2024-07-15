import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { MainPageSectionEc } from '../models/main-page-section/main-page-section-ec.interface';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { GetPagedMainPageSectionsEcQueryParams } from '../models/query-params/get-paged-main-page-sections-ec-query-params.interface';

@Injectable()
export class MainPageSectionEcService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilderService = inject(UrlBuilderService);

  private readonly _baseUrl = `${this._enviromentService.apiEcommerceUrl}/main-page-sections`;

  getPagedMainPageSections(queryParams: GetPagedMainPageSectionsEcQueryParams) {
    return this._client.get<ApiPagedResponse<MainPageSectionEc>>(
      this._urlBuilderService.buildUrl(this._baseUrl, queryParams),
    );
  }
}
