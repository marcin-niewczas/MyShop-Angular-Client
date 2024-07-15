import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ProductListItemEc } from '../models/product/product-list-item-ec.interface';
import { BaseProductDetailEc } from '../models/product/product-detail-ec.interface';
import { ProductReviewEc } from '../models/product-review/product-review-ec.interface';
import { GetPagedProductReviewsQueryParams } from '../../../shared/models/requests/query-models/product-review/get-paged-product-reviews-query-params.interface';
import { GetPagedProductsEcQueryParams } from '../models/query-params/get-paged-products-ec-query-params.interface';
import { GetPagedProductsEcSortBy } from '../models/query-sort-by/get-paged-products-ec-sort-by.enum';
import { ProductVariantEc } from '../models/product/product-variant-ec.interface';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ProductReviewRateStats } from '../../../shared/models/product/product-review-rate-stats.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { ValueData } from '../../../shared/models/value-data.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { GetProductsNamesEcQueryParams } from '../models/query-params/get-products-names-ec-query-params.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductEcService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilderService = inject(UrlBuilderService);

  private readonly _baseUrl = `${this._enviromentService.apiEcommerceUrl}/products`;

  readonly minPageSize = 16;

  readonly defaultSortBy = GetPagedProductsEcSortBy.Newest;

  readonly availablePageSizes: readonly number[] = [this.minPageSize, 32, 48];

  readonly paginationQueryProductsListKeys: readonly string[] = [
    'PageSize',
    'PageNumber',
  ];

  readonly basicSortAndFiltersQueryProductsListKeys: readonly string[] = [
    'SortBy',
    'MinPrice',
    'MaxPrice',
  ];

  readonly availableBasicQueryProductsListKeys: readonly string[] = [
    ...this.paginationQueryProductsListKeys,
    ...this.basicSortAndFiltersQueryProductsListKeys,
  ];

  getPagedProductListItems(queryParams: GetPagedProductsEcQueryParams) {
    return this._client.get<ApiPagedResponse<ProductListItemEc>>(
      this._urlBuilderService.buildUrl(this._baseUrl, queryParams),
    );
  }

  getPagedProductReviews(
    id: string,
    queryParams: GetPagedProductReviewsQueryParams,
  ) {
    return this._client.get<ApiPagedResponse<ProductReviewEc>>(
      this._urlBuilderService.buildUrl(
        `${this._baseUrl}/${id}/product-reviews`,
        queryParams,
      ),
    );
  }

  getProductReviewMeByProductId(productId: string) {
    return this._client.get<ApiResponse<ProductReviewEc>>(
      `${this._baseUrl}/${productId}/product-reviews/me`,
    );
  }

  getProductReviewRateStats(productId: string) {
    return this._client.get<ApiResponse<ProductReviewRateStats>>(
      `${this._baseUrl}/${productId}/product-reviews/rate-stats`,
    );
  }

  getProductDetail(encodedProductName: string) {
    return this._client.get<ApiResponse<BaseProductDetailEc>>(
      `${this._baseUrl}/${encodedProductName}`,
    );
  }

  getProductsNames(queryParams: GetProductsNamesEcQueryParams) {
    return this._client.get<ApiResponse<ValueData<string[]>>>(
      this._urlBuilderService.buildUrl(`${this._baseUrl}/names`, queryParams),
    );
  }

  getProductVariants(encodedProductName: string) {
    return this._client.get<ApiResponse<readonly ProductVariantEc[]>>(
      `${this._baseUrl}/${encodedProductName}/product-variants`,
    );
  }

  createFavorite(encodedProductName: string) {
    return this._client.post(
      `${this._baseUrl}/${encodedProductName}/favorites`,
      {},
    );
  }

  removeFavorite(encodedProductName: string) {
    return this._client.delete(
      `${this._baseUrl}/${encodedProductName}/favorites`,
    );
  }
}
