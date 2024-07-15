import { ApiResponse } from './api-response.interface';

export interface ApiPagedResponse<TData> extends ApiResponse<TData[]> {
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly totalCount: number;
  readonly isNext: boolean;
}
