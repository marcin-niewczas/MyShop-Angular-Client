import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ProductFiltersEc } from '../models/product/product-filters-ec.interface';
import { Observable, Subject, forkJoin, map, of, switchMap } from 'rxjs';
import { GetPagedCategoriesEcQueryParams } from '../models/query-params/get paged-categories-ec-query-params.interface';
import { GetProductFiltersByCategoryIdEcQueryParams } from '../models/query-params/get-product-filters-by-category-id-ec-query-params.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { EnvironmentService } from '../../../../environments/environment.service';
import { GetPagedCategoriesQueryParam } from '../../../shared/models/requests/query-models/category/get-paged-categories-query-param.enum';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { CategoryEc } from '../models/category/category-ec.interface';

@Injectable()
export class CategoryEcService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilder = inject(UrlBuilderService);

  private readonly _baseUrl: string = `${this._enviromentService.apiEcommerceUrl}/categories`;

  private readonly _queryParams: GetPagedCategoriesEcQueryParams = {
    pageNumber: 1,
    pageSize: 10,
    queryType: GetPagedCategoriesQueryParam.RootAndLowerCategories,
  };

  private readonly _loadPagedCategoriesSubject = new Subject<void>();
  readonly categories = toSignal(
    this._loadPagedCategoriesSubject.pipe(
      switchMap(() =>
        this.getPagedCategories(this._queryParams).pipe(
          switchMap((response) => {
            if (response.isNext) {
              const tasks = [] as Observable<CategoryEc[]>[];

              for (let i = 2; i <= response.totalPages; i++) {
                this._queryParams.pageNumber = i;
                tasks.push(
                  this.getPagedCategories(this._queryParams).pipe(
                    map((response) => response.data),
                  ),
                );
              }

              return forkJoin(tasks).pipe(
                map((task) => {
                  response.data.push(...task.flatMap((r) => r));

                  return response.data;
                }),
              );
            }

            return of(response.data);
          }),
        ),
      ),
    ),
  );

  loadCategories() {
    this._loadPagedCategoriesSubject.next();
  }

  getPagedCategories(queryParams: GetPagedCategoriesEcQueryParams) {
    return this._client.get<ApiPagedResponse<CategoryEc>>(
      this._urlBuilder.buildUrl(this._baseUrl, queryParams),
    );
  }

  getByEncodedCategoryName(encodedCategoryName: string) {
    return this._client.get<ApiResponse<CategoryEc>>(
      `${this._baseUrl}/${encodedCategoryName}`,
    );
  }

  getProductFiltersByEncodedCategoryName(
    encodedCategoryName: string,
    queryParams: GetProductFiltersByCategoryIdEcQueryParams,
  ) {
    return this._client.get<ApiResponse<ProductFiltersEc>>(
      this._urlBuilder.buildUrl(
        `${this._baseUrl}/${encodedCategoryName}/product-filters`,
        queryParams,
      ),
    );
  }
}
