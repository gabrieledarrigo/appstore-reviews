import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import { startPolling, stopPolling } from './services/poller';

const APP_IDS = process.env.APP_IDS
  ? process.env.APP_IDS.split(',').map(id => id.trim())
  : [];

if (APP_IDS.length === 0) {
  throw new Error('No APP_IDS provided in environment variables');
}

const app = express();
const port = 3001;

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/', (_req, res) => {
  res.json({ message: 'Server is running' });
});

app.get('/reviews', (_req, res) => {
  res.json({ message: 'Reviews endpoint', data: [] });
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, 'localhost', () => {
  console.log(`Server running on http://localhost:${port}`);
  startPolling(APP_IDS);
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
