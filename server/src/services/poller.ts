import { config } from '../config/env';
import { storeReviews } from './rss';

let pollingId: NodeJS.Timeout | null = null;

export async function pollRSSFeeds(appIds: string[]): Promise<void> {
  for (const appId of appIds) {
    await storeReviews(appId)
      .then(() => {
        console.log(
          `Successfully polled and stored reviews for appId: ${appId}`
        );
      })
      .catch(error => {
        console.error(`Error polling reviews for appId: ${appId}`, error);
      });
  }
}

export async function startPolling(appIds: string[]): Promise<void> {
  await pollRSSFeeds(appIds);

  pollingId = setInterval(
    () => {
      pollRSSFeeds(appIds).catch(error => {
        console.error('Error during polling:', error);
      });
    },
    config.pollingIntervalInMinutes * 60 * 1000
  );
}

export function stopPolling(): void {
  if (pollingId) {
    clearInterval(pollingId);
    pollingId = null;
  }

  console.log('Polling stopped.');
}
