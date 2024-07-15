import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ValuePosition } from '../../../shared/models/helpers/value-position.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { CreateProductVariantPhotoItemsMp } from '../models/product-variant/create-product-variant-photo-items-mp.class';
import { ProductVariantMp } from '../models/product-variant/product-variant-mp.interface';
import { ProductVariantPhotoItemMp } from '../models/product-variant/product-variant-photo-item-mp.interface';
import { ProductVariantValidatorParametersMp } from '../models/product-variant/product-variant-validator-parameters-mp.interface';
import { UpdateProductVariantMp } from '../models/product-variant/update-product-variant-mp.class';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProductVariantMpService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);

  private readonly _baseUrl = `${this._enviromentService.apiManagementPanelUrl}/product-variants`;

  private _validatorParameters?: ProductVariantValidatorParametersMp;

  get validatorParameters() {
    return this._validatorParameters;
  }

  getProductVariant(id: string) {
    return this._client.get<ApiResponse<ProductVariantMp>>(
      `${this._baseUrl}/${id}`,
    );
  }

  createProductVariantPhotos(id: string, idPositions: ValuePosition<string>[]) {
    return this._client.post(
      `${this._baseUrl}/${id}/product-variant-photo-items`,
      idPositions,
    );
  }

  createProductVariantPhotoItems(model: CreateProductVariantPhotoItemsMp) {
    return this._client.post(
      `${this._baseUrl}/${model.id}/product-variant-photo-items`,
      model,
    );
  }

  uploadProductVariantPhotos(id: string, formData: FormData) {
    return this._client.post(
      `${this._baseUrl}/${id}/product-variant-photo-items/upload`,
      formData,
    );
  }

  getValidatorParameters() {
    return this._client
      .get<
        ApiResponse<ProductVariantValidatorParametersMp>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(tap((response) => (this._validatorParameters = response.data)));
  }

  update(model: UpdateProductVariantMp) {
    return this._client.put(`${this._baseUrl}/${model.id}`, model);
  }

  getProductVariantPhotoItems(id: string) {
    return this._client.get<ApiResponse<ProductVariantPhotoItemMp[]>>(
      `${this._baseUrl}/${id}/product-variant-photo-items`,
    );
  }

  updatePositionsOfProductVariantPhotoItems(
    id: string,
    model: ValuePosition<string>[],
  ) {
    return this._client.patch(
      `${this._baseUrl}/${id}/product-variant-photo-items/positions`,
      model,
    );
  }

  removeProductVariantPhotoItems(id: string) {
    return this._client.delete(
      `${this._baseUrl}/product-variant-photo-items/${id}`,
    );
  }
}
