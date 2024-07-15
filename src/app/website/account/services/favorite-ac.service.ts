import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GetPagedFavoritesAcQueryParams } from '../models/favorite/get-paged-favorites-ac-query-params.interface';
import { EnvironmentService } from '../../../../environments/environment.service';
import { ProductListItem } from '../../../shared/models/product/product-list-item.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';

@Injectable()
export class FavoriteAcService {
  private readonly _client = inject(HttpClient);
  private readonly _environment = inject(EnvironmentService);
  private readonly _urlBuilderService = inject(UrlBuilderService);

  private readonly _baseUrl = `${this._environment.apiAccountUrl}/favorites`;

  readonly minPageSize = 10;
  readonly allowedPageSize = [this.minPageSize, 15, 25];
  readonly availableFilters = ['SearchPhrase', 'SortBy', 'SortDirection'];
  readonly availablePaginationQueryKey = ['PageSize', 'PageNumber'];

  getPagedData(queryParams: GetPagedFavoritesAcQueryParams) {
    return this._client.get<ApiPagedResponse<ProductListItem>>(
      this._urlBuilderService.buildUrl(this._baseUrl, queryParams),
    );
  }

  removeFavorite(encodedProductName: string) {
    return this._client.delete(
      `${this._environment.apiEcommerceUrl}/products/${encodedProductName}/favorites`,
    );
  }
}
