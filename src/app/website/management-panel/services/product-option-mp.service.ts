import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ProductOptionType } from '../../../shared/models/product-option/product-option-type.enum';
import { ApiIdResponse } from '../../../shared/models/responses/api-id-response.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { ProductOptionValueMp } from '../models/product-option-value/product-option-value-mp.interface';
import { CreateProductDetailOptionMp } from '../models/product-option/details/create-product-detail-option-mp.class';
import { UpdatePositionsOfProductDetailOptionValuesMp } from '../models/product-option/details/update-positions-of-product-detail-option-values-mp.class';
import { UpdateProductDetailOptionMp } from '../models/product-option/details/update-product-detail-option-mp.class';
import { ProductOptionMp } from '../models/product-option/product-option-mp.interface';
import { ProductOptionValidatorParametersMp } from '../models/product-option/product-option-validator-parameters-mp.interface';
import { CreateProductVariantOptionMp } from '../models/product-option/variants/create-product-variant-option-mp.class';
import { UpdatePositionsOfProductVariantOptionValuesMp } from '../models/product-option/variants/update-positions-of-product-variant-option-values-mp.class';
import { UpdateProductVariantOptionMp } from '../models/product-option/variants/update-product-variant-option-mp.class';
import { GetPagedProductOptionValuesByProductOptionIdMpQueryParams } from '../models/query-params/get-paged-product-option-values-by-product-option-id-mp-query-params.interface';
import { GetPagedProductOptionsMpQueryParams } from '../models/query-params/get-paged-product-options-mp-query-params.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProductOptionMpService {
  readonly minPageSize = 10;
  readonly allowedPageSize: readonly number[] = [this.minPageSize, 15, 25];
  readonly availableFilters: readonly string[] = [
    'SearchPhrase',
    'SortBy',
    'SortDirection',
  ];
  readonly availablePaginationQueryKey: readonly string[] = [
    'PageSize',
    'PageNumber',
  ];

  constructor(
    private readonly _enviromentService: EnvironmentService,
    private readonly _client: HttpClient,
    private readonly _urlBuilder: UrlBuilderService,
  ) {}

  private readonly _baseUrl: string = `${this._enviromentService.apiManagementPanelUrl}/product-options`;

  private _validatorParameters?: ProductOptionValidatorParametersMp | undefined;
  get validatorParameters(): ProductOptionValidatorParametersMp | undefined {
    return this._validatorParameters;
  }

  getValidatorParameters() {
    return this._client
      .get<
        ApiResponse<ProductOptionValidatorParametersMp>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._validatorParameters = response.data;
          return response.data;
        }),
      );
  }

  getPagedData(queryParams: GetPagedProductOptionsMpQueryParams) {
    return this._client.get<ApiPagedResponse<ProductOptionMp>>(
      this._urlBuilder.buildUrl(this._baseUrl, queryParams),
    );
  }

  getById(id: string) {
    return this._client.get<ApiResponse<ProductOptionMp>>(
      `${this._baseUrl}/${id}`,
    );
  }

  create(
    createModel: CreateProductVariantOptionMp | CreateProductDetailOptionMp,
  ) {
    if (createModel instanceof CreateProductVariantOptionMp) {
      return this._client.post<ApiIdResponse>(
        `${this._baseUrl}/variants`,
        createModel,
      );
    }

    return this._client.post<ApiIdResponse>(
      `${this._baseUrl}/details`,
      createModel,
    );
  }

  update(
    updateModel: UpdateProductVariantOptionMp | UpdateProductDetailOptionMp,
  ) {
    if (updateModel instanceof UpdateProductVariantOptionMp) {
      return this._client.put<ApiResponse<ProductOptionMp>>(
        `${this._baseUrl}/variants/${updateModel.id}`,
        updateModel,
      );
    }

    return this._client.put<ApiResponse<ProductOptionMp>>(
      `${this._baseUrl}/details/${updateModel.id}`,
      updateModel,
    );
  }

  remove(productOption: ProductOptionMp) {
    switch (productOption.productOptionType) {
      case ProductOptionType.Variant:
        return this._client.delete(
          `${this._baseUrl}/variants/${productOption.id}`,
        );
      case ProductOptionType.Detail:
        return this._client.delete(
          `${this._baseUrl}/details/${productOption.id}`,
        );
      default:
        throw Error('Not implemented.');
    }
  }

  getPagedProductOptionValuesByProductOptionId(
    id: string,
    queryParams: GetPagedProductOptionValuesByProductOptionIdMpQueryParams,
  ) {
    return this._client.get<ApiPagedResponse<ProductOptionValueMp>>(
      this._urlBuilder.buildUrl(
        `${this._baseUrl}/${id}/product-option-values`,
        queryParams,
      ),
    );
  }
  updatePositionsOfProductOptionValues(
    model:
      | UpdatePositionsOfProductDetailOptionValuesMp
      | UpdatePositionsOfProductVariantOptionValuesMp,
  ) {
    if (model instanceof UpdatePositionsOfProductVariantOptionValuesMp) {
      return this._client.put(
        `${this._baseUrl}/variants/${model.productVariantOptionId}/product-variant-option-values`,
        model,
      );
    }

    return this._client.put(
      `${this._baseUrl}/details/${model.productDetailOptionId}/product-detail-option-values`,
      model,
    );
  }
}
