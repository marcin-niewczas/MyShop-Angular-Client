export interface PhotoValidatorParameters {
    readonly allowedContentTypes: string[];
    readonly allowedPhotoExtensions: string[];
    readonly maxSizeInMegabytes: number;
    readonly multiple: boolean;
    readonly maxPhotosCount: boolean;
  }