import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ValuePosition } from '../../../shared/models/helpers/value-position.interface';
import { ApiIdResponse } from '../../../shared/models/responses/api-id-response.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { ValueData } from '../../../shared/models/value-data.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { ChangeActivityStatusofWebsiteHeroSectionItemMp } from '../models/main-page-sections/change-activity-status-of-website-hero-section-item-mp.interface';
import { CreateWebsiteHeroSectionMp } from '../models/main-page-sections/create-website-hero-section-mp.class';
import { CreateWebsiteProductCarouselSectionMp } from '../models/main-page-sections/create-website-product-carousel-section.class';
import { MainPageSectionMp } from '../models/main-page-sections/main-page-section-mp.interface';
import { MainPageSectionValidatorParametersMp } from '../models/main-page-sections/main-page-sections-validator-parameters-mp.interface';
import { UpdatePositionsOfActiveWebsiteHeroSectionItemsMp } from '../models/main-page-sections/update-positions-of-active-website-hero-section-items-mp.class';
import { UpdateWebsiteHeroSectionMp } from '../models/main-page-sections/update-website-hero-section-mp.class';
import { WebsiteHeroSectionItemMp } from '../models/main-page-sections/website-hero-section-item-mp.interface';
import { WebsiteHeroSectionItemValidatorParametersMp } from '../models/main-page-sections/website-hero-section-item-validator-parameters-mp.interface';
import { GetPagedWebsiteHeroSectionItemsMpQueryParams } from '../models/query-params/get-paged-website-hero-items-mp-query-params.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MainPageSectionMpService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilder = inject(UrlBuilderService);

  private readonly _baseUrl: string = `${this._enviromentService.apiManagementPanelUrl}/main-page-sections`;

  private _mainPageSectionValidatorParameters?:
    | MainPageSectionValidatorParametersMp
    | undefined;
  get mainPageSectionValidatorParameters():
    | MainPageSectionValidatorParametersMp
    | undefined {
    return this._mainPageSectionValidatorParameters;
  }

  private _websiteHeroSectionItemValidatorParameters?:
    | WebsiteHeroSectionItemValidatorParametersMp
    | undefined;
  get websiteHeroSectionItemValidatorParameters():
    | WebsiteHeroSectionItemValidatorParametersMp
    | undefined {
    return this._websiteHeroSectionItemValidatorParameters;
  }

  getAllMainPageSections() {
    return this._client.get<ApiResponse<MainPageSectionMp[]>>(this._baseUrl);
  }

  getMainPageSectionValidatorParameters() {
    return this._client
      .get<
        ApiResponse<MainPageSectionValidatorParametersMp>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._mainPageSectionValidatorParameters = response.data;
          return response.data;
        }),
      );
  }

  getMainPageSectionsCount() {
    return this._client.get<ApiResponse<ValueData<number>>>(
      `${this._baseUrl}/count`,
    );
  }

  getWebsiteHeroSectionItemValidatorParameters(id: string) {
    return this._client
      .get<
        ApiResponse<WebsiteHeroSectionItemValidatorParametersMp>
      >(`${this._baseUrl}/website-hero-sections/${id}/website-hero-section-items/validator-parameters`)
      .pipe(
        map((response) => {
          this._websiteHeroSectionItemValidatorParameters = response.data;
          return response.data;
        }),
      );
  }

  getWebsiteHeroSectionItem(id: string) {
    return this._client.get<ApiResponse<WebsiteHeroSectionItemMp>>(
      `${this._baseUrl}/website-hero-section-items/${id}`,
    );
  }

  savePositionsOfMainPageSections(idPositions: ValuePosition<string>[]) {
    return this._client.patch(this._baseUrl, { idPositions });
  }

  getMainPageSection(id: string) {
    return this._client.get<ApiResponse<MainPageSectionMp>>(
      `${this._baseUrl}/${id}`,
    );
  }

  removeMainPageSection(id: string) {
    return this._client.delete(`${this._baseUrl}/${id}`);
  }

  createWebsiteHeroSection(model: CreateWebsiteHeroSectionMp) {
    return this._client.post<ApiIdResponse>(
      `${this._baseUrl}/website-hero-sections`,
      model,
    );
  }

  getPagedWebsiteHeroSectionItems(
    id: string,
    queryParams: GetPagedWebsiteHeroSectionItemsMpQueryParams,
  ) {
    return this._client.get<ApiPagedResponse<WebsiteHeroSectionItemMp>>(
      this._urlBuilder.buildUrl(
        `${this._baseUrl}/website-hero-sections/${id}/website-hero-section-items`,
        queryParams,
      ),
    );
  }

  createWebsiteHeroSectionItem(id: string, formData: FormData) {
    return this._client.post<ApiIdResponse>(
      `${this._baseUrl}/website-hero-sections/${id}/website-hero-section-items`,
      formData,
    );
  }

  updateWebsiteHeroSectionItem(id: string, formData: FormData) {
    return this._client.put(
      `${this._baseUrl}/website-hero-section-items/${id}`,
      formData,
    );
  }

  removeWebsiteHeroSectionItem(id: string) {
    return this._client.delete(
      `${this._baseUrl}/website-hero-section-items/${id}`,
    );
  }

  changeActivityStatusofWebsiteHeroSectionItem(
    model: ChangeActivityStatusofWebsiteHeroSectionItemMp,
  ) {
    return this._client.patch(
      `${this._baseUrl}/website-hero-section-items/${model.id}/activity-statuses`,
      model,
    );
  }

  updateWebsiteHeroSection(model: UpdateWebsiteHeroSectionMp) {
    return this._client.patch(
      `${this._baseUrl}/website-hero-sections/${model.id}`,
      model,
    );
  }

  updatePositionsOfActiveWebsiteHeroSectionItems(
    model: UpdatePositionsOfActiveWebsiteHeroSectionItemsMp,
  ) {
    return this._client.patch(
      `${this._baseUrl}/website-hero-sections/${model.websiteHeroSectionId}/website-hero-section-items/positions`,
      model,
    );
  }

  createWebsiteProductCarouselSection(
    model: CreateWebsiteProductCarouselSectionMp,
  ) {
    return this._client.post<ApiIdResponse>(
      `${this._baseUrl}/website-product-carousel-sections`,
      model,
    );
  }
}
