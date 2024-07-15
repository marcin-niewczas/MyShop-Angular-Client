import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from '../../../../environments/environment.service';
import { CreateProductProductDetailOptionValueMp } from '../models/product-product-detail-option-value/create-product-product-detail-option-value-mp.class';
import { UpdateProductProductDetailOptionValueMp } from '../models/product-product-detail-option-value/update-product-product-detail-option-value-mp.class';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProductProductDetailOptionValueMpService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);

  private readonly _baseUrl = `${this._enviromentService.apiManagementPanelUrl}/product-product-detail-option-values`;

  createProductProductDetailOptionValue(
    model: CreateProductProductDetailOptionValueMp,
  ) {
    return this._client.post(this._baseUrl, model);
  }

  removeProductDetailOptionOfProduct(id: string) {
    return this._client.delete(`${this._baseUrl}/${id}`);
  }

  updateProductProductDetailOptionValue(
    model: UpdateProductProductDetailOptionValueMp,
  ) {
    return this._client.patch(`${this._baseUrl}/${model.id}`, model);
  }
}
