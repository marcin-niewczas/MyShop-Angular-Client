export interface ApiResponse<TData> {
  readonly data: TData;
}

export function isApiResponse<TData>(value: any): value is ApiResponse<TData> {
  return !!value?.data;
}
