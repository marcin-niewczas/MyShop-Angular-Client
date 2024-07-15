export interface ProductReviewEc {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  review?: string;
  rate: number;
  userFirstName: string;
  userPhotoUrl?: string;
}
