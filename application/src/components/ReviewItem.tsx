import { Review } from '../api/reviews';

interface ReviewItemProps {
  review: Review;
}

export function ReviewItem({ review }: ReviewItemProps) {
  return (
    <article key={review.id} className="review">
      <h3 className="review-title">{review.title}</h3>
      <p className="review-author">
        by {review.author} on {new Date(review.date).toLocaleDateString()}
      </p>
      <p className="review-rating">{'⭐'.repeat(review.rating)}</p>
      <p className="review-content">{review.content}</p>
    </article>
  );
}
