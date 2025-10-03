import { describe, it, expect, jest } from '@jest/globals';
import { App } from '../types';

jest.mock('./rss');
jest.mock('../config/env', () => ({
  config: {
    APPS: [
      { id: '123456789', name: 'Test App 1' },
      { id: '987654321', name: 'Test App 2' },
    ],
    pollingIntervalInMinutes: 30,
  },
}));

describe('Poller Service', () => {
  describe('pollRSSFeeds', () => {
    it('should poll RSS feeds for given app IDs', async () => {
      const APPS: App[] = [
        { id: '123456789', name: 'Test App 1' },
        { id: '', name: 'Test App 2' },
      ];

      const { storeReviews } = await import('./rss');
      const { pollRSSFeeds } = await import('./poller');

      const mockStoreReviews = storeReviews as jest.MockedFunction<
        typeof storeReviews
      >;
      mockStoreReviews.mockResolvedValue();

      await pollRSSFeeds(APPS);

      expect(mockStoreReviews).toHaveBeenNthCalledWith(1, APPS[0]);
      expect(mockStoreReviews).toHaveBeenNthCalledWith(2, APPS[1]);
    });
  });
});
