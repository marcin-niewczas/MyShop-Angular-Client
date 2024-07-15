import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';

export interface PhotoMp extends BaseIdTimestampResponse {
  readonly name: string;
  readonly photoExtension: string;
  readonly contentType: string;
  readonly photoSize: number;
  readonly url: string;
  readonly alt: string;
  readonly photoType: string;
}
