import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { EnvironmentService } from '../../../../environments/environment.service';
import { SortDirection } from '../../../shared/models/requests/query-models/common/sort-direction.enum';
import { ApiPagedResponse } from '../../../shared/models/responses/api-paged-response.interface';
import { ApiResponse } from '../../../shared/models/responses/api-response.interface';
import { UrlBuilderService } from '../../../shared/services/url-builder.service';
import { OrderDetailMp } from '../models/order/order-detail-mp.interface';
import { OrderMp } from '../models/order/order-mp.interface';
import { OrderValidatorParametersMp } from '../models/order/order-validator-parameters-mp.interface';
import { PagedOrderMp } from '../models/order/paged-order-mp.interface';
import { UpdateOrderMp } from '../models/order/update-order-mp.interface';
import { GetPagedOrdersMpQueryParams } from '../models/query-params/get-paged-orders-mp-query-params.interface';
import { GetPagedOrdersMpSortBy } from '../models/query-sort-by/get-paged-orders-mp-sort-by.enum';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class OrderMpService {
  private readonly _enviromentService = inject(EnvironmentService);
  private readonly _client = inject(HttpClient);
  private readonly _urlBuilder = inject(UrlBuilderService);

  private readonly _baseUrl = `${this._enviromentService.apiManagementPanelUrl}/orders`;

  readonly minPageSize = 10;
  readonly defaultSortBy = GetPagedOrdersMpSortBy.CreatedAt;
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

  private _validatorParameters?: OrderValidatorParametersMp | undefined;
  get validatorParameters(): OrderValidatorParametersMp | undefined {
    return this._validatorParameters;
  }

  getPagedData(queryParams: GetPagedOrdersMpQueryParams) {
    return this._client.get<ApiPagedResponse<PagedOrderMp>>(
      this._urlBuilder.buildUrl(this._baseUrl, queryParams),
    );
  }

  getOrder(id: string) {
    return this._client.get<ApiResponse<OrderMp>>(`${this._baseUrl}/${id}`);
  }

  getOrderDetails(id: string) {
    return this._client.get<ApiResponse<OrderDetailMp>>(
      `${this._baseUrl}/${id}/details`,
    );
  }

  getValidatorParameters() {
    return this._client
      .get<
        ApiResponse<OrderValidatorParametersMp>
      >(`${this._baseUrl}/validator-parameters`)
      .pipe(
        map((response) => {
          this._validatorParameters = response.data;
          return response.data;
        }),
      );
  }

  update(model: UpdateOrderMp) {
    return this._client.put(`${this._baseUrl}/${model.id}`, model);
  }
}
