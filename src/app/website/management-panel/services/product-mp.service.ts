import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ProductReviewRateStats } from '../../../shared/models/product/product-review-rate-stats.interface';
import { PaginationQueryParams } from '../../../shared/models/requests/query-models/common/pagination-query-params.interface';
import { GetPagedProductReviewsQueryParams } from '../../../shared/models/requests/query-models/product-review/get-paged-product-reviews-query-params.interface';
import { ApiIdResponse } from '../../../shared/models/responses/api-id-response.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { PhotoMp } from '../models/photos/photo-mp.interface';
import { ProductDetailOptionOfProductMp } from '../models/product-option/details/product-detail-option-of-product-mp.interface';
import { ProductVariantOptionOfProductMp } from '../models/product-option/variants/product-variant-option-of-product-mp.interface';
import { PagedProductReviewMp } from '../models/product-review/paged-product-review-mp.interface';
import { CreateProductVariantMp } from '../models/product-variant/create-product-variant-mp.class';
import { PagedProductVariantMp } from '../models/product-variant/paged-product-variant-mp.interface';
import { CreateProductMp } from '../models/product/create-product-mp.class';
import { ProductMp } from '../models/product/product-mp.interface';
import { ProductValidatorParametersMp } from '../models/product/product-validator-parameters-mp.interface';
import { UpdateProductMp } from '../models/product/update-product-mp.interface';
import { UpdateProductOptionsPositionsOfProductMp } from '../models/product/update-product-options-positions-of-product-mp.class';
import { GetPagedProductOptionValuesByProductOptionIdMpQueryParams } from '../models/query-params/get-paged-product-option-values-by-product-option-id-mp-query-params.interface';
import { GetPagedProductPhotosByProductIdMpQueryParams } from '../models/query-params/get-paged-product-photos-by-product-id-mp-query-params.interface';
import { GetPagedProductVariantsByProductIdMpQueryParams } from '../models/query-params/get-paged-product-variants-by-product-id-mp-query-params.interface';
import { GetPagedProductsMpQueryParams } from '../models/query-params/get-paged-products-mp-query-params.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProductMpService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilder = inject(UrlBuilderService);

  readonly minPageSizeForPagedProducts = 10;
  readonly allowedPageSizeForPagedProducts: readonly number[] = [
    this.minPageSizeForPagedProducts,
    15,
    25,
  ];
  readonly availableFiltersForPagedProducts: readonly string[] = [
    'SearchPhrase',
    'SortBy',
    'SortDirection',
  ];
  readonly availablePaginationQueryKeyForPagedProducts: readonly string[] = [
    'PageSize',
    'PageNumber',
  ];

  private readonly _baseUrl: string = `${this._enviromentService.apiManagementPanelUrl}/products`;

  private _validatorParameters?: ProductValidatorParametersMp | undefined;
  get validatorParameters(): ProductValidatorParametersMp | undefined {
    return this._validatorParameters;
  }

  getValidatorParameters() {
    return this._client
      .get<
        ApiResponse<ProductValidatorParametersMp>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._validatorParameters = response.data;
          return response.data;
        }),
      );
  }

  getPagedProducts(queryParams: GetPagedProductsMpQueryParams) {
    return this._client.get<ApiPagedResponse<ProductMp>>(
      this._urlBuilder.buildUrl(this._baseUrl, queryParams),
    );
  }

  getPagedProductVariantOptionsByProductId(
    id: string,
    queryParams: GetPagedProductOptionValuesByProductOptionIdMpQueryParams,
  ) {
    return this._client.get<ApiPagedResponse<ProductVariantOptionOfProductMp>>(
      this._urlBuilder.buildUrl(
        `${this._baseUrl}/${id}/product-variant-options`,
        queryParams,
      ),
    );
  }

  getPagedProductPhotosByProductId(
    id: string,
    queryParams: GetPagedProductPhotosByProductIdMpQueryParams,
  ) {
    return this._client.get<ApiPagedResponse<PhotoMp>>(
      this._urlBuilder.buildUrl(`${this._baseUrl}/${id}/photos`, queryParams),
    );
  }

  getById(id: string) {
    return this._client.get<ApiResponse<ProductMp>>(`${this._baseUrl}/${id}`);
  }

  create(createModel: CreateProductMp) {
    return this._client.post<ApiIdResponse>(this._baseUrl, createModel);
  }

  updateProduct(model: UpdateProductMp) {
    return this._client.put<ApiIdResponse>(
      `${this._baseUrl}/${model.id}`,
      model,
    );
  }

  createProductVariant(model: CreateProductVariantMp) {
    return this._client.post<ApiIdResponse>(
      `${this._baseUrl}/${model.productId}/product-variants`,
      model,
    );
  }

  getPagedProductVariantsByProductId(
    id: string,
    queryParams: GetPagedProductVariantsByProductIdMpQueryParams,
  ) {
    return this._client.get<ApiPagedResponse<PagedProductVariantMp>>(
      this._urlBuilder.buildUrl(
        `${this._baseUrl}/${id}/product-variants`,
        queryParams,
      ),
    );
  }

  getPagedProductDetailOptionsByProductId(
    id: string,
    queryParams: PaginationQueryParams,
  ) {
    return this._client.get<ApiPagedResponse<ProductDetailOptionOfProductMp>>(
      this._urlBuilder.buildUrl(
        `${this._baseUrl}/${id}/product-detail-options`,
        queryParams,
      ),
    );
  }

  saveProductDetailOptionsPositionsOfProduct(
    model: UpdateProductOptionsPositionsOfProductMp,
  ) {
    return this._client.patch(
      `${this._baseUrl}/${model.productId}/product-detail-options/positions`,
      model,
    );
  }

  saveProductVariantOptionsPositionsOfProduct(
    model: UpdateProductOptionsPositionsOfProductMp,
  ) {
    return this._client.patch(
      `${this._baseUrl}/${model.productId}/product-variant-options/positions`,
      model,
    );
  }

  getProductReviewRateStats(productId: string) {
    return this._client.get<ApiResponse<ProductReviewRateStats>>(
      `${this._enviromentService.apiEcommerceUrl}/products/${productId}/product-reviews/rate-stats`,
    );
  }

  getPagedProductReviewsByProductId(
    id: string,
    queryParams: GetPagedProductReviewsQueryParams,
  ) {
    return this._client.get<ApiPagedResponse<PagedProductReviewMp>>(
      this._urlBuilder.buildUrl(
        `${this._baseUrl}/${id}/product-reviews`,
        queryParams,
      ),
    );
  }
}
