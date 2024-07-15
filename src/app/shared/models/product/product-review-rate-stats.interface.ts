export interface ProductReviewRateStats {
  productReviewsCount: number;
  sumProductReviews: number;
  avarageProductReviews: number;
  rateCounts: { rate: number; count: number }[];
}
