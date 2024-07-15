import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { EnvironmentService } from '../../../../environments/environment.service';
import { OrderWithProducts } from '../../../shared/models/order/order-with-products.interface';
import { Order } from '../../../shared/models/order/order.interface';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiIdResponse } from '../../../shared/models/responses/api-id-response.interface';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { GetPagedOrdersEcQueryParams } from '../models/query-params/get-paged-orders-ec-query-params.interface';
import { GetPagedOrdersEcSortBy } from '../models/query-sort-by/get-paged-orders-ec-sort-by.enum';
import { HttpClient } from '@angular/common/http';
import { CreateAuthUserOrderEc, CreateGuestOrderEc } from '../models/order/create-order-ec.class';
import { OrderStatusInfoEc } from '../models/order/order-status-info-ec.interface';
import { OrderValidatorParametersEc } from '../models/order/order-validator-parameters-ec.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderEcService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilderService = inject(UrlBuilderService);

  private readonly _baseUrl = `${this._enviromentService.apiEcommerceUrl}/orders`;

  readonly minPageSize = 10;
  readonly defaultSortBy = GetPagedOrdersEcSortBy.Newest;
  readonly defaultSortDirection = SortDirection.Desc;
  readonly allowedPageSizes: readonly number[] = [this.minPageSize, 15, 25];
  readonly availableFilters: readonly string[] = [
    'SearchPhrase',
    'SortBy',
    'SortDirection',
    'FromDate',
    'ToDate',
  ];
  readonly availablePaginationQueryKey: readonly string[] = [
    'PageSize',
    'PageNumber',
  ];

  private _validatorParameters?: OrderValidatorParametersEc | undefined;
  get validatorParameters(): OrderValidatorParametersEc | undefined {
    return this._validatorParameters;
  }

  getValidatorParameters() {
    return this._client
      .get<
        ApiResponse<OrderValidatorParametersEc>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._validatorParameters = response.data;
          return response.data;
        }),
      );
  }

  get(orderId: string) {
    return this._client.get<ApiResponse<OrderWithProducts>>(
      `${this._baseUrl}/${orderId}`,
    );
  }

  getPagedData(queryParams: GetPagedOrdersEcQueryParams) {
    return this._client.get<ApiPagedResponse<Order>>(
      this._urlBuilderService.buildUrl(this._baseUrl, queryParams),
    );
  }

  getOrderStatus(orderId: string) {
    return this._client.get<ApiResponse<OrderStatusInfoEc>>(
      `${this._baseUrl}/${orderId}/status`,
    );
  }

  create(model: CreateAuthUserOrderEc | CreateGuestOrderEc) {
    return this._client.post<ApiIdResponse>(`${this._baseUrl}`, model);
  }

  cancelOrder(orderId: string) {
    return this._client.delete(`${this._baseUrl}/${orderId}/cancellation`);
  }
}
