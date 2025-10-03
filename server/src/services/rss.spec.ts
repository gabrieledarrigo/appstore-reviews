import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { RssData, storeReviews } from './rss';
import * as fs from 'fs/promises';

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

  describe('storeReviews', () => {
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

    it('should fetch and store reviews', async () => {
      const appId = '123456789';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => rssData,
      } as Response);

      jest
        .spyOn(fs, 'readFile')
        .mockRejectedValueOnce(new Error('File not exists'));

      jest.spyOn(fs, 'writeFile').mockResolvedValue();

      const expected = {
        appId,
        lastPolled: new Date().toISOString(),
        reviews: [
          {
            id: 'review_123',
            appId,
            author: 'Gabriele',
            title: 'Great app!',
            content: 'I love this application',
            rating: 5,
            date: new Date('2025-10-01T00:00:00Z'),
          },
        ],
      };

      await storeReviews(appId);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://itunes.apple.com/us/rss/customerreviews/id=123456789/sortBy=mostRecent/page=1/json'
      );
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining(`reviews_${appId}.json`),
        'utf-8'
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`reviews_${appId}.json`),
        JSON.stringify(expected, null, 2),
        'utf-8'
      );
    });

    it('should handle fetch errors gracefully', async () => {
      const appId = '123456789';

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      jest
        .spyOn(fs, 'readFile')
        .mockRejectedValueOnce(new Error('File not exists'));

      jest.spyOn(fs, 'writeFile').mockResolvedValue();

      const expected = {
        appId,
        lastPolled: new Date().toISOString(),
        reviews: [],
      };

      await storeReviews(appId);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://itunes.apple.com/us/rss/customerreviews/id=123456789/sortBy=mostRecent/page=1/json'
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`reviews_${appId}.json`),
        JSON.stringify(expected, null, 2),
        'utf-8'
      );
    });

    it('should merge new reviews with existing ones and avoid duplicates', async () => {
      const appId = '123456789';

      const existingReviews = {
        appId,
        lastPolled: '2025-09-01T00:00:00Z',
        reviews: [
          {
            id: 'review_123',
            appId,
            author: 'Gabriele',
            title: 'Great app!',
            content: 'I love this application',
            rating: 5,
            date: new Date('2025-10-01T00:00:00Z'),
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

      const expected = {
        appId,
        lastPolled: new Date().toISOString(),
        reviews: [
          ...existingReviews.reviews,
          {
            id: 'review_124',
            appId,
            author: 'Jane Smith',
            title: 'Not bad',
            content: 'It works fine',
            rating: 4,
            date: new Date('2025-10-02T00:00:00Z'),
          },
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

      await storeReviews(appId);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://itunes.apple.com/us/rss/customerreviews/id=123456789/sortBy=mostRecent/page=1/json'
      );
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining(`reviews_${appId}.json`),
        'utf-8'
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(`reviews_${appId}.json`),
        JSON.stringify(expected, null, 2),
        'utf-8'
      );
    });
  });
});
