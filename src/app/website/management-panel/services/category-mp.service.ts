import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { CategoryMp } from '../models/category/category-mp.interface';
import { CreateCategoryMp } from '../models/category/create-category-mp.class';
import { UpdateCategoryMp } from '../models/category/update-category-mp.class';
import { GetPagedCategoriesMpQueryParams } from '../models/query-params/get-paged-categories-mp-query-params.interface';
import { GetPagedProductCategoriesByCategoryRootIdMpQueryParams } from '../models/query-params/get-paged-product-categories-by-root-id-mp-query-params.interface';
import { map } from 'rxjs';
import { CategoryValidatorParametersMp } from '../models/category/category-validator-parameters.interface';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ApiIdResponse } from '../../../shared/models/responses/api-id-response.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { GetCategoryMpQueryType } from '../models/query-types/get-category-mp-query-type.enum';

@Injectable()
export class CategoryMpService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilder = inject(UrlBuilderService);

  private readonly _baseUrl: string = `${this._enviromentService.apiManagementPanelUrl}/categories`;

  private _validatorParameters?: CategoryValidatorParametersMp | undefined;
  get validatorParameters(): CategoryValidatorParametersMp | undefined {
    return this._validatorParameters;
  }

  getValidatorParameters() {
    return this._client
      .get<
        ApiResponse<CategoryValidatorParametersMp>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._validatorParameters = response.data;
          return response.data;
        }),
      );
  }

  getPagedData(queryParams: GetPagedCategoriesMpQueryParams) {
    return this._client.get<ApiPagedResponse<CategoryMp>>(
      this._urlBuilder.buildUrl(this._baseUrl, queryParams),
    );
  }

  getPagedProductCategoriesByCategoryRootId(
    rootId: string,
    queryParams: GetPagedProductCategoriesByCategoryRootIdMpQueryParams,
  ) {
    return this._client.get<ApiPagedResponse<CategoryMp>>(
      this._urlBuilder.buildUrl(
        `${this._baseUrl}/${rootId}/product-categories`,
        queryParams,
      ),
    );
  }

  getById(id: string, queryType: GetCategoryMpQueryType) {
    return this._client.get<ApiResponse<CategoryMp>>(
      `${this._baseUrl}/${id}?queryType=${queryType}`,
    );
  }

  create(model: CreateCategoryMp) {
    return this._client.post<ApiIdResponse>(this._baseUrl, model);
  }

  update(id: string, model: UpdateCategoryMp) {
    return this._client.put<ApiResponse<CategoryMp>>(
      `${this._baseUrl}/${id}`,
      model,
    );
  }

  remove(id: string) {
    return this._client.delete(`${this._baseUrl}/${id}`);
  }
}
