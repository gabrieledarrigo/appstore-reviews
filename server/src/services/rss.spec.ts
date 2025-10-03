import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { RssData, StoredReviews, storeReviews } from './rss';
import * as fs from 'fs/promises';
import { App } from '../types';

jest.mock('fs/promises');

describe('RSS Service', () => {
  const mockFetch = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    global.fetch = mockFetch;
    jest.useFakeTimers().setSystemTime(new Date('2025-10-10'));
  });

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('storeReviews', () => {
    const app: App = { id: '123456789', name: 'Test App' };

    it('should fetch and store reviews', async () => {
      const rssData = {
        feed: {
          entry: [
            {
              id: { label: 'review_123' },
              title: { label: 'Great app!' },
              content: { label: 'I love this application', type: 'text' },
              'im:rating': { label: '5' },
              author: { name: { label: 'Gabriele' } },
              updated: { label: '2025-10-01T00:00:00Z' },
            },
          ],
        },
      } as RssData;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => rssData,
      } as Response);

      jest
        .spyOn(fs, 'readFile')
        .mockRejectedValueOnce(new Error('File not exists'));

      jest.spyOn(fs, 'writeFile').mockResolvedValue();

      const expected: StoredReviews = {
        id: app.id,
        name: app.name,
        lastPolled: '2025-10-10T00:00:00.000Z',
        reviews: [
          {
            id: 'review_123',
            appId: app.id,
            author: 'Gabriele',
            title: 'Great app!',
            content: 'I love this application',
            rating: 5,
            date: '2025-10-01T00:00:00Z',
          },
        ],
      };

      await storeReviews(app);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://itunes.apple.com/us/rss/customerreviews/id=123456789/sortBy=mostRecent/page=1/json'
      );
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining(`reviews_${app.id}.json`),
        'utf-8'
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`reviews_${app.id}.json`),
        JSON.stringify(expected, null, 2),
        'utf-8'
      );
    });

    it('should handle fetch errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      jest
        .spyOn(fs, 'readFile')
        .mockRejectedValueOnce(new Error('File not exists'));

      jest.spyOn(fs, 'writeFile').mockResolvedValue();

      const expected: StoredReviews = {
        id: app.id,
        name: app.name,
        lastPolled: new Date().toISOString(),
        reviews: [],
      };

      await storeReviews(app);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`reviews_${app.id}.json`),
        JSON.stringify(expected, null, 2),
        'utf-8'
      );
    });

    it('should merge new reviews with existing ones to avoid duplicates and sort by date', async () => {
      const existingReviews = {
        id: app.id,
        name: app.name,
        lastPolled: '2025-09-01T00:00:00Z',
        reviews: [
          {
            id: 'review_123',
            appId: app.id,
            author: 'Gabriele',
            title: 'Great app!',
            content: 'I love this application',
            rating: 5,
            date: '2025-10-01T00:00:00Z',
          },
        ],
      };

      const rssData = {
        feed: {
          entry: [
            {
              id: { label: 'review_123' },
              title: { label: 'Great app!' },
              content: { label: 'I love this application', type: 'text' },
              'im:rating': { label: '5' },
              author: { name: { label: 'Gabriele' } },
              updated: { label: '2025-10-01T00:00:00Z' },
            },
            {
              id: { label: 'review_124' },
              title: { label: 'Not bad' },
              content: { label: 'It works fine', type: 'text' },
              'im:rating': { label: '4' },
              author: { name: { label: 'Jane Smith' } },
              updated: { label: '2025-10-02T00:00:00Z' },
            },
          ],
        },
      };

      const expected: StoredReviews = {
        id: app.id,
        name: app.name,
        lastPolled: '2025-10-10T00:00:00.000Z',
        reviews: [
          {
            id: 'review_124',
            appId: app.id,
            author: 'Jane Smith',
            title: 'Not bad',
            content: 'It works fine',
            rating: 4,
            date: '2025-10-02T00:00:00Z',
          },
          ...existingReviews.reviews,
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => rssData,
      } as Response);

      jest
        .spyOn(fs, 'readFile')
        .mockResolvedValueOnce(JSON.stringify(existingReviews));
      jest.spyOn(fs, 'writeFile').mockResolvedValue();

      await storeReviews(app);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`reviews_${app.id}.json`),
        JSON.stringify(expected, null, 2),
        'utf-8'
      );
    });
  });
});
