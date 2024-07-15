import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreateProductReviewEc } from '../models/product-review/create-product-review-ec.class';
import { ProductReviewEc } from '../models/product-review/product-review-ec.interface';
import { UpdateProductReviewEc } from '../models/product-review/update-product-review-ec.class';
import { ProductReviewValidatorParametersEc } from '../models/product-review/product-review-validator-parameters-ec.interface';
import { map } from 'rxjs';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductReviewEcService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);

  private readonly _baseUrl = `${this._enviromentService.apiEcommerceUrl}/product-reviews`;

  private _validatorParameters?: ProductReviewValidatorParametersEc | undefined;
  get validatorParameters(): ProductReviewValidatorParametersEc | undefined {
    return this._validatorParameters;
  }

  getValidatorParameters() {
    return this._client
      .get<
        ApiResponse<ProductReviewValidatorParametersEc>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._validatorParameters = response.data;
          return response.data;
        }),
      );
  }

  create(model: CreateProductReviewEc) {
    return this._client.post<ApiResponse<ProductReviewEc>>(
      this._baseUrl,
      model,
    );
  }

  update(model: UpdateProductReviewEc) {
    return this._client.put<ApiResponse<ProductReviewEc>>(
      `${this._baseUrl}/${model.id}`,
      model,
    );
  }

  remove(productReviewId: string) {
    return this._client.delete(`${this._baseUrl}/${productReviewId}`);
  }
}
