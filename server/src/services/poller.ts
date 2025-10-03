import { config } from '../config/env';
import { App } from '../types';
import { storeReviews } from './rss';

let pollingId: NodeJS.Timeout | null = null;

export async function pollRSSFeeds(apps: App[]): Promise<void> {
  for (const app of apps) {
    await storeReviews(app)
      .then(() => {
        console.log(
          `Successfully polled and stored reviews for appId: ${app.id}`
        );
      })
      .catch(error => {
        console.error(`Error polling reviews for appId: ${app.id}`, error);
      });
  }
}

export async function startPolling(apps: App[]): Promise<void> {
  await pollRSSFeeds(apps);

  pollingId = setInterval(
    () => {
      pollRSSFeeds(apps).catch(error => {
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
