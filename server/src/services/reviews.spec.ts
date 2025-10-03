import { describe, it, beforeAll, afterAll, expect, jest } from '@jest/globals';
import * as fs from 'fs/promises';
import { getReviews, ReviewsNotFoundError } from './reviews';
import { StoredReviews } from './rss';

jest.mock('fs/promises');

describe('Reviews', () => {
  beforeAll(() => {
    // Today is 10 October 2025 at 12:00
    jest.useFakeTimers().setSystemTime(new Date('2025-10-01T12:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getReviews', () => {
    const appId = '123456789';

    const reviews: StoredReviews = {
      appId,
      lastPolled: '2025-10-01T11:00:00.000Z',
      reviews: [
        {
          id: 'review_123',
          appId,
          author: 'Gabriele',
          title: 'Great app!',
          content: 'I love this application',
          rating: 5,
          date: '2025-10-01T10:00:00Z', // 2 hours ago
        },
        {
          id: 'review_124',
          appId,
          author: 'John Doe',
          title: 'Excellent',
          content: 'Perfect app',
          rating: 5,
          date: '2025-10-01T11:30:00Z', // 30 minutes ago
        },
        {
          id: 'review_125',
          appId,
          author: 'Jane Smith',
          title: 'Not bad',
          content: 'It works fine',
          rating: 4,
          date: '2025-10-01T07:00:00Z', // 5 hours ago
        },
      ],
    };

    it('should filter reviews within the time window (4 hours)', async () => {
      jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(reviews));

      const actual = await getReviews({ appId, hours: 4 });

      expect(actual).toEqual([
        {
          id: 'review_123',
          appId,
          author: 'Gabriele',
          title: 'Great app!',
          content: 'I love this application',
          rating: 5,
          date: '2025-10-01T10:00:00Z', // 2 hours ago
        },
        {
          id: 'review_124',
          appId,
          author: 'John Doe',
          title: 'Excellent',
          content: 'Perfect app',
          rating: 5,
          date: '2025-10-01T11:30:00Z', // 30 minutes ago
        },
      ]);
    });

    it('should use default 48 hours if not specified', async () => {
      jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(reviews));

      const actual = await getReviews({ appId }); // No hours specified

      // All reviews are present
      expect(actual).toHaveLength(3);
    });

    it('should return an empty array if no reviews are in the time window', async () => {
      const oldReviews: StoredReviews = {
        appId,
        lastPolled: '2025-10-01T11:00:00.000Z',
        reviews: [
          {
            id: 'review_999',
            appId,
            author: 'Old User',
            title: 'Old review',
            content: 'Very old',
            rating: 3,
            date: '2025-09-01T00:00:00Z', // 30 days ago
          },
        ],
      };

      jest.spyOn(fs, 'readFile').mockResolvedValue(JSON.stringify(oldReviews));

      const actual = await getReviews({ appId, hours: 24 });

      expect(actual).toEqual([]);
    });

    it('should throw a ReviewsNotFoundError when a review file for the given appId does not exist', async () => {
      class TestError extends Error {
        constructor(public readonly code: string) {
          super('File not found');
        }
      }

      jest.spyOn(fs, 'readFile').mockRejectedValue(new TestError('ENOENT'));

      await expect(
        getReviews({
          appId,
        })
      ).rejects.toThrow(ReviewsNotFoundError);
    });
  });
});
