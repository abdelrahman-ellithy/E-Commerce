import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { ApiError } from './utils/ApiError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../frontend/dist');

const allowedOrigins = env.clientUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          connectSrc: ["'self'", ...allowedOrigins],
          upgradeInsecureRequests: env.isProduction ? [] : null,
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        return callback(ApiError.forbidden('This origin is not allowed to access the API.'));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));
  app.use(compression());

  if (!env.isTest) {
    app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  }

  app.use('/api', apiLimiter);
  app.use('/api/v1', routes);

  // Unknown API routes always return JSON, even in production where the SPA
  // fallback below would otherwise serve index.html.
  app.use('/api', notFound);

  if (env.isProduction) {
    if (fs.existsSync(clientDist)) {
      app.use(express.static(clientDist, { maxAge: '1d', index: false }));

      app.get('*', (req, res, next) => {
        res.sendFile(path.join(clientDist, 'index.html'), (error) => {
          if (error) next(error);
        });
      });
    } else {
      console.warn(
        `[startup] Frontend build not found at ${clientDist}. Run "npm run build" first.`
      );
    }
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

const app = createApp();

export default app;
