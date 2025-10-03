import dotenv from 'dotenv';
import { App } from '../types';

dotenv.config();

function parseApps(): App[] {
  const appsEnv = process.env.APPS;

  if (!appsEnv) {
    throw new Error('APPS environment variable is required');
  }

  return JSON.parse(appsEnv);
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  pollingIntervalInMinutes: process.env.POLLING_INTERVAL_IN_MINUTES
    ? parseInt(process.env.POLLING_INTERVAL_IN_MINUTES, 10)
    : 30,
  apps: parseApps(),
} as const;
