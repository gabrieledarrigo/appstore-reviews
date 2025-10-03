import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import * as rss from './rss';

jest.mock('./rss', () => ({
  storeReviews: jest.fn(),
}));

describe('Poller Service', () => {
  const originalEnv = process.env;
  const APP_IDS = ['123456789', '987654321'];

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      APP_IDS: APP_IDS.join(','),
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('pollRSSFeeds', () => {
    it('should poll RSS feeds for given app IDs', async () => {
      const mockStoreReviews = rss.storeReviews as jest.MockedFunction<
        typeof rss.storeReviews
      >;
      mockStoreReviews.mockResolvedValue();

      const { pollRSSFeeds } = await import('./poller');

      await pollRSSFeeds(APP_IDS);

      expect(mockStoreReviews).toHaveBeenNthCalledWith(1, APP_IDS[0]);
      expect(mockStoreReviews).toHaveBeenNthCalledWith(2, APP_IDS[1]);
    });
  });
});
