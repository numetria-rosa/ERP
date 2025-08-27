import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import hrRouter from './modules/hr';
import accountingRouter from './modules/accounting';
import inventoryRouter from './modules/inventory';
import crmRouter from './modules/crm';
import projectsRouter from './modules/projects';
import reportsRouter from './modules/reports';
import authRouter from './modules/auth';
import automationRouter from './modules/automation';
import insightsRouter from './modules/insights';
import searchRouter from './modules/search';

// Initialize automation service
import './services/automationService';

dotenv.config();

const app = express();

app.set('trust proxy', 1); // or true, or the number of proxies in front of you
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/hr', hrRouter);
app.use('/api/accounting', accountingRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/crm', crmRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRouter);
app.use('/api/automation', automationRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/search', searchRouter);

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app; 