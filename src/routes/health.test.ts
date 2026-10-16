import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import healthRouter from './health';

// Mock the Prisma client so the health endpoint never touches a real database.
// The same `$queryRaw` mock instance is shared across every `new PrismaClient()`
// call, so controlling it here also controls the instance created inside the router.
jest.mock('@prisma/client', () => {
  const queryRaw = jest.fn();
  return {
    PrismaClient: jest.fn(() => ({ $queryRaw: queryRaw })),
  };
});

const prisma = new PrismaClient() as unknown as { $queryRaw: jest.Mock };

const app = express();
app.use(healthRouter);

describe('GET /health', () => {
  beforeEach(() => {
    prisma.$queryRaw.mockReset();
  });

  it('returns 200 and a healthy status when the database is connected', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.timestamp).toBeDefined();
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('returns 503 and an unhealthy status when the database is unreachable', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('Connection refused'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('unhealthy');
    expect(response.body.error).toBe('Connection refused');
    expect(response.body.timestamp).toBeDefined();
  });

  it('responds in under 100ms', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const start = Date.now();
    const response = await request(app).get('/health');
    const elapsed = Date.now() - start;

    expect(response.status).toBe(200);
    expect(elapsed).toBeLessThan(100);
  });

  it('returns a valid ISO-8601 timestamp', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const response = await request(app).get('/health');

    const { timestamp } = response.body;
    expect(typeof timestamp).toBe('string');
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });
});
