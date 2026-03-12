import { Context } from 'hono';
import { prisma } from '@repo/database';
import { StorageService } from '@repo/storage';

export interface HealthCheckDependencies {
  storage: StorageService;
}

interface ServiceStatus {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    storage: ServiceStatus;
  };
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkStorage(storage: StorageService): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    await storage.list();
    return {
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function createHealthCheckHandler(dependencies: HealthCheckDependencies) {
  return async (c: Context) => {
    const { storage } = dependencies;

    const [databaseStatus, storageStatus] = await Promise.all([
      checkDatabase(),
      checkStorage(storage),
    ]);

    const services = {
      api: { status: 'healthy' as const },
      database: databaseStatus,
      storage: storageStatus,
    };

    const allHealthy = Object.values(services).every((s) => s.status === 'healthy');
    const anyUnhealthy = Object.values(services).some((s) => s.status === 'unhealthy');

    const response: HealthCheckResponse = {
      status: anyUnhealthy ? 'unhealthy' : allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services,
    };

    const statusCode = response.status === 'healthy' ? 200 : response.status === 'degraded' ? 200 : 503;

    return c.json(response, statusCode);
  };
}

export function createLivenessHandler() {
  return (c: Context) => {
    return c.json({ status: 'alive', timestamp: new Date().toISOString() });
  };
}

export function createReadinessHandler() {
  return async (c: Context) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return c.json({ status: 'ready', timestamp: new Date().toISOString() });
    } catch (error) {
      return c.json(
        {
          status: 'not ready',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        503
      );
    }
  };
}
