import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from '../../../../environments/environment.service';
import { PaginationQueryParams } from '../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { PhotoMp } from '../models/photos/photo-mp.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class PhotoMpService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilder = inject(UrlBuilderService);

  private readonly _baseUrl: string = `${this._enviromentService.apiManagementPanelUrl}/photos`;

  getPagedWebsiteHeroSectionPhotos(queryParams: PaginationQueryParams) {
    return this._client.get<ApiPagedResponse<PhotoMp>>(
      this._urlBuilder.buildUrl(
        `${this._baseUrl}/website-hero-section-photos`,
        queryParams,
      ),
    );
  }
}
