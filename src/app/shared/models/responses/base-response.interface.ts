export interface BaseIdResponse {
  readonly id: string;
}

export interface BaseTimestampResponse {
  readonly createdAt: string;
  readonly updatedAt?: string;
}

export interface BaseIdTimestampResponse
  extends BaseIdResponse,
    BaseTimestampResponse {}
