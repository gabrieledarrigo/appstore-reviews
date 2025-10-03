import * as fs from 'fs/promises';
import * as path from 'path';
import { Review } from '../types';

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
  updated: Label; // ISO date string
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
  appId: string;
  lastPolled: string; // ISO date string
  reviews: Review[];
}

const RSS_URL =
  'https://itunes.apple.com/us/rss/customerreviews/id={appId}/sortBy=mostRecent/page=1/json';

async function fetchRssFeed(appId: string): Promise<RssData> {
  const url = RSS_URL.replace('{appId}', appId);

  const response = await fetch(url);

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
    date: new Date(entry.updated.label),
  }));
}

export async function storeReviews(appId: string): Promise<void> {
  const reviews = await fetchRssFeed(appId)
    .then(data => parseRssData(data, appId))
    .catch(err => {
      console.error('Error fetching RSS feed:', err);
      return [];
    });

  const dataDir = path.join(__dirname, '../../data');
  const filePath = path.join(dataDir, `reviews_${appId}.json`);

  await fs.mkdir(dataDir, { recursive: true });

  const existingData = await fs
    .readFile(filePath, 'utf-8')
    .then(data => JSON.parse(data))
    .catch(() => ({ appId, reviews: [] }));

  const allReviews = [...existingData.reviews, ...reviews];

  // Remove duplicates based on review ID
  const uniqueReviews = [
    ...new Map(allReviews.map(review => [review.id, review])).values(),
  ];

  const newData = {
    appId,
    lastPolled: new Date().toISOString(),
    reviews: uniqueReviews,
  };

  await fs.writeFile(filePath, JSON.stringify(newData, null, 2), 'utf-8');
}
