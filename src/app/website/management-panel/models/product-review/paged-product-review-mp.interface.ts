export interface PagedProductReviewMp {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  review?: string;
  rate: number;
  userFirstName: string;
  userLastName: string;
  userPhotoUrl?: string;
}
