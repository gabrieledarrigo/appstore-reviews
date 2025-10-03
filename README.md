# App store reviews

> [![CI](https://github.com/gabrieledarrigo/appstore-reviews/actions/workflows/build.yml/badge.svg)](https://github.com/gabrieledarrigo/appstore-reviews/actions/workflows/build.yml)

A full-stack application to monitor and display recent iOS App Store reviews.

## Overview

The repository contains two applications:

- **[server](./server)**: Node.js (Express) backend that polls RSS feeds from the App Store, stores reviews in JSON files, and exposes a REST API
- **[application](./application)**: React frontend that displays reviews with filtering capabilities

## Quick Start

### Prerequisites

- Node.js 22.x
- npm >= 10.x

### Installation

The repository uses [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces).  
Install dependencies for both applications with:

```bash
npm install
```

### Build and test

Run tests (server only):

```bash
npm test
```

Build both applications for production:

```bash
npm run build
```

### Configuration

1. Copy the environment file in the server workspace:

   ```bash
   cp server/.env.example server/.env
   ```

2. The server is already configured to monitor two applications. By default the [React application](./application/src/App.tsx#L5-L6) will request reviews for one of these apps (Splitwise).
   You can modify the `.env` file to change the apps, polling interval, and server port:

   ```bash
   # Example configuration
   APPS=[{"id":"595068606","name":"Splitwise"},{"id":"447188370","name":"Snapchat"}]
   POLLING_INTERVAL_MINUTES=30
   PORT=3001
   ```

   - `APPS`: A JSON array of app configurations (id from App Store URL, and the name for display)
   - `POLLING_INTERVAL_MINUTES`: How often to fetch new reviews (default: 30 minutes)
   - `PORT`: Server port (default: 3001)

### Running

Start both the server and the client in development mode:

```bash
npm run dev
```

- **Server**: `http://localhost:3001`
- **Client**: `http://localhost:5173`

The server exposes the following endpoint:

- `GET /` - Health check and configuration info
- `GET /api/v1/apps/:appId/reviews?hours=:hours` - Get reviews for a specific app
