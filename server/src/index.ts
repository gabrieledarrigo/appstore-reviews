import { config } from './config/env';
import express from 'express';
import { startPolling, stopPolling } from './services/poller';
import { getReviews, ReviewsNotFoundError } from './services/reviews';

const app = express();
const port = config.port;

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', (_req, res) => {
  res.json({ data: 'Server is running' });
});

app.get('/reviews', async (req, res, next) => {
  const { appId, hours } = req.query;

  if (!appId) {
    return res.status(400).json({
      error: 'appId is required',
    });
  }

  const reviews = await getReviews({
    appId: appId as string,
    hours: hours ? parseInt(hours as string, 10) : undefined,
  }).catch(err => {
    if (err instanceof ReviewsNotFoundError) {
      return res.status(404).json({
        error: 'Not Found',
        message: err.message,
      });
    }

    return next(err);
  });

  res.json({
    data: reviews,
  });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Express error:', err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      error: 'Internal server error',
      message: err.message || 'Something went wrong',
    });
  }
);

app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, 'localhost', () => {
  console.log(`Server running on http://localhost:${port}`);
  startPolling(config.appIds);
});

process.on('SIGTERM', () => {
  stopPolling();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  stopPolling();
  process.exit(1);
});
