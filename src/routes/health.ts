import { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /health
 *
 * Liveness/readiness probe used by Docker HEALTHCHECK and Kubernetes probes.
 * Validates database connectivity with a lightweight `SELECT 1` query and
 * reports the current status alongside an ISO-8601 timestamp.
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
