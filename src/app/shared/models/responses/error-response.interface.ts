export interface ErrorResponse {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly errorMessage?: string;
}
