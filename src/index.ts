import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import healthRouter from './routes/health.js';

dotenv.config();

const app = express();

app.use('/health', healthRouter);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Vlog API' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
