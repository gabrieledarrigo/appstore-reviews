import * as fs from 'fs/promises';
import * as path from 'path';
import { App, Review } from '../types';

type Label = { label: string };

type RssEntry = {
  id: Label;
  title: Label;
  content: { label: string; type: string };
  'im:rating': Label;
  author: {
    name: Label;
    uri?: Label;
  };
  'im:version': Label;
  updated: Label; // ISO 8601
  link?: { attributes: { href: string } };
};

export type RssData = {
  feed: {
    author: {
      name: Label;
      uri: Label;
    };
    entry?: RssEntry[];
    updated: Label;
  };
};

export interface StoredReviews {
  id: string;
  name: string;
  lastPolled: string; // ISO 8601
  reviews: Review[];
}

async function fetchRssFeed(appId: string): Promise<RssData> {
  const URL = `https://itunes.apple.com/us/rss/customerreviews/id=${appId}/sortBy=mostRecent/page=1/json`;

  const response = await fetch(URL);

  if (!response.ok) {
    throw new Error('Failed to fetch RSS feed');
  }

  return response.json();
}

async function parseRssData(
  rssData: RssData,
  appId: string
): Promise<Review[]> {
  return (rssData.feed.entry ?? []).map(entry => ({
    id: entry.id.label,
    appId,
    author: entry.author.name.label,
    title: entry.title.label,
    content: entry.content.label,
    rating: parseInt(entry['im:rating'].label, 10),
    date: entry.updated.label,
  }));
}

export async function storeReviews(app: App): Promise<void> {
  const { id, name } = app;
  const reviews = await fetchRssFeed(id)
    .then(data => parseRssData(data, id))
    .catch(err => {
      console.error('Error fetching RSS feed:', err);
      return [];
    });

  const dataDir = path.join(__dirname, '../../data');
  const filePath = path.join(dataDir, `reviews_${id}.json`);

  await fs.mkdir(dataDir, { recursive: true });

  const existingData = await fs
    .readFile(filePath, 'utf-8')
    .then(data => JSON.parse(data))
    .catch(() => ({ id, name, reviews: [] }));

  const allReviews: Review[] = [...existingData.reviews, ...reviews];

  // Remove duplicates based on review ID
  const uniqueReviews = [
    ...new Map(allReviews.map(review => [review.id, review])).values(),
  ].toSorted((a, b) => b.date.localeCompare(a.date));

  const newData: StoredReviews = {
    id,
    name,
    lastPolled: new Date().toISOString(),
    reviews: uniqueReviews,
  };

  await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf-8');
}
