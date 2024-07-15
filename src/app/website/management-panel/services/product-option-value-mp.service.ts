import { Injectable } from '@angular/core';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ProductOptionType } from '../../../shared/models/product-option/product-option-type.enum';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { CreateProductDetailOptionValueMp } from '../models/product-option-value/details/create-product-detail-option-value-mp.class';
import { UpdateProductDetailOptionValueMp } from '../models/product-option-value/details/update-product-detail-option-value-mp.class';
import { ProductOptionValueMp } from '../models/product-option-value/product-option-value-mp.interface';
import { CreateProductVariantOptionValueMp } from '../models/product-option-value/variants/create-product-variant-option-value-mp.class';
import { UpdateProductVariantOptionValueMp } from '../models/product-option-value/variants/update-product-variant-option-value-mp.class';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProductOptionValueMpService {
  constructor(
    private readonly _enviromentService: EnvironmentService,
    private readonly _client: HttpClient,
  ) {}

  private readonly _baseUrl: string = `${this._enviromentService.apiManagementPanelUrl}/product-option-values`;

  create(
    createModel:
      | CreateProductVariantOptionValueMp
      | CreateProductDetailOptionValueMp,
  ) {
    if (createModel instanceof CreateProductVariantOptionValueMp) {
      return this._client.post<ApiResponse<ProductOptionValueMp>>(
        `${this._baseUrl}/variants`,
        createModel,
      );
    }

    return this._client.post<ApiResponse<ProductOptionValueMp>>(
      `${this._baseUrl}/details`,
      createModel,
    );
  }

  update(
    model: UpdateProductVariantOptionValueMp | UpdateProductDetailOptionValueMp,
  ) {
    if (model instanceof UpdateProductVariantOptionValueMp) {
      return this._client.put<ApiResponse<ProductOptionValueMp>>(
        `${this._baseUrl}/variants/${model.id}`,
        model,
      );
    }

    return this._client.put<ApiResponse<ProductOptionValueMp>>(
      `${this._baseUrl}/details/${model.id}`,
      model,
    );
  }

  remove(id: string, productOptionType: ProductOptionType) {
    switch (productOptionType) {
      case ProductOptionType.Variant:
        return this._client.delete(`${this._baseUrl}/variants/${id}`);
      case ProductOptionType.Detail:
        return this._client.delete(`${this._baseUrl}/details/${id}`);
      default:
        throw Error('Not implemented.');
    }
  }
}
