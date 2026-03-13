import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from '../config/env';
import weatherRoutes from './routes/weather';
import proofRoutes from './routes/proof';
import verifyRoutes from './routes/verify';
import stationsRoutes from './routes/stations';
import eventsRoutes from './routes/events';
import { readyProbe } from './routes/ready';

/**
 * Create and configure the Express application
 */
export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }));
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  app.get('/ready', readyProbe);

  // Mount routes
  app.use('/api/weather', weatherRoutes);
  app.use('/api/proof', proofRoutes);
  app.use('/api/verify', verifyRoutes);
  app.use('/api/stations', stationsRoutes);
  app.use('/api/events', eventsRoutes);

  // Error handling middleware
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    });
  });

  return app;
}

/**
 * Start the API server
 */
export function startApiServer(): Promise<ReturnType<Application['listen']>> {
  return new Promise((resolve) => {
    const app = createApp();
    const server = app.listen(config.API_PORT, () => {
      console.log(`✓ API server listening on port ${config.API_PORT}`);
      resolve(server);
    });
  });
}
