import { Review } from '../api/reviews';
import { ReviewItem } from './ReviewItem';

export type ReviewsProps = {
  reviews: Review[];
};

export function Reviews({ reviews }: ReviewsProps) {
  if (reviews.length === 0) {
    return <div className="no-reviews">No reviews found.</div>;
  }

  return (
    <>
      {reviews.map(review => (
        <ReviewItem review={review} key={review.id} />
      ))}
    </>
  );
}
