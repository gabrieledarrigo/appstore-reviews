import * as fs from 'fs/promises';
import * as path from 'path';
import { Review, ReviewsQuery } from '../types';
import { StoredReviews } from './rss';

export class ReviewsNotFoundError extends Error {
  constructor(appId: string) {
    super(`Reviews not found for app ${appId}`);
    this.name = 'ReviewsNotFoundError';
  }
}

export async function getReviews(query: ReviewsQuery): Promise<Review[]> {
  const { id, hours = 48 } = query;

  const data = await fs
    .readFile(path.join(__dirname, '../../data', `reviews_${id}.json`), 'utf-8')
    .catch(err => {
      if (err.code === 'ENOENT') {
        throw new ReviewsNotFoundError(id);
      }

      throw err;
    });

  const { reviews } = JSON.parse(data) as StoredReviews;
  const cutoff = Date.now() - hours * 60 * 60 * 1000;

  return reviews.filter(review => new Date(review.date).getTime() >= cutoff);
}
