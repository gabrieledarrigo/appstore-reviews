import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  appIds: process.env.APP_IDS
    ? process.env.APP_IDS.split(',').map(id => id.trim())
    : [],
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

if (config.appIds.length === 0) {
  throw new Error('No APP_IDS provided in environment variables');
}
