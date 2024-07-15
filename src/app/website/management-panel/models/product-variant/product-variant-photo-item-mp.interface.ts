import { BaseIdTimestampResponse } from '../../../../shared/models/responses/base-response.interface';
import { PhotoMp } from '../photos/photo-mp.interface';

export interface ProductVariantPhotoItemMp extends BaseIdTimestampResponse{
    readonly photo: PhotoMp;
    readonly position: number;
}