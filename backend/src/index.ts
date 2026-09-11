import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import followupRoutes from './routes/followup.routes';
import productRoutes from './routes/product.routes';
import stockMovementRoutes from './routes/stock-movement.routes';
import challanRoutes from './routes/challan.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// ─── Middleware ───────────────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// HTTP request logger
app.use(morgan('dev'));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/challans', challanRoutes);

/**
 * GET /api/health
 * Health check endpoint — confirms the API is running.
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Mini ERP + CRM API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Mini ERP + CRM API running`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port        : ${PORT}`);
  console.log(`   Health      : http://localhost:${PORT}/api/health`);
  console.log(`   CORS Origin : ${CORS_ORIGIN}\n`);
});

export default app;
