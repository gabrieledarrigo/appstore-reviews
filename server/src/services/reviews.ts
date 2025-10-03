import * as fs from 'fs/promises';
import * as path from 'path';
import { Review, ReviewsQuery } from '../types';
import { StoredReviews } from './rss';

export async function getReviews(query: ReviewsQuery): Promise<Review[]> {
  const { appId, hours = 48 } = query;

  const data = await fs.readFile(
    path.join(__dirname, '../../data', `reviews_${appId}.json`),
    'utf-8'
  );

  const { reviews } = JSON.parse(data) as StoredReviews;
  const cutoff = Date.now() - hours * 60 * 60 * 1000;

  return reviews.filter(review => new Date(review.date).getTime() >= cutoff);
}
