#!/usr/bin/env node

// PostPal WebSocket Server Startup Script
// Production-ready WebSocket server with clustering and monitoring

import { createServer } from 'http';
import PostPalWebSocketServer, { getWebSocketServer } from './websocket-server';
import { createServerClient } from './supabase';
// import { monitoring } from './monitoring'; // TODO: Add monitoring module
import cluster from 'cluster';
import os from 'os';

interface ServerConfig {
  port: number;
  host: string;
  cluster: boolean;
  workers: number;
  enableMonitoring: boolean;
  enableHealthChecks: boolean;
}

class PostPalWebSocketCluster {
  private config: ServerConfig;
  private workers: Map<number, any> = new Map();
  private isShuttingDown = false;

  constructor(config: ServerConfig) {
    this.config = config;
  }

  // Start the WebSocket server cluster
  async start(): Promise<void> {
    console.log('🚀 Starting PostPal WebSocket Server Cluster...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔧 Configuration:`, this.config);

    if (this.config.cluster && cluster.isPrimary) {
      await this.startCluster();
    } else {
      await this.startWorker();
    }
  }

  // Start cluster with multiple workers
  private async startCluster(): Promise<void> {
    console.log(`👥 Starting cluster with ${this.config.workers} workers`);

    // Fork workers
    for (let i = 0; i < this.config.workers; i++) {
      const worker = cluster.fork();
      this.workers.set(worker.process.pid!, worker);
      
      worker.on('message', (message) => {
        this.handleWorkerMessage(worker, message);
      });

      worker.on('exit', (code, signal) => {
        console.log(`👷 Worker ${worker.process.pid} exited with code ${code} and signal ${signal}`);
        this.workers.delete(worker.process.pid!);
        
        if (!this.isShuttingDown) {
          console.log('🔄 Restarting worker...');
          const newWorker = cluster.fork();
          this.workers.set(newWorker.process.pid!, newWorker);
        }
      });
    }

    // Handle cluster events
    cluster.on('exit', (worker, code, signal) => {
      console.log(`👷 Worker ${worker.process.pid} died`);
    });

    // Graceful shutdown
    this.setupGracefulShutdown();
  }

  // Start individual worker
  private async startWorker(): Promise<void> {
    const workerId = cluster.worker?.id || 'standalone';
    console.log(`👷 Starting worker ${workerId} (PID: ${process.pid})`);

    try {
      // Create HTTP server
      const httpServer = createServer();
      
      // Create WebSocket server
      const wsServer = new PostPalWebSocketServer(httpServer);
      
      // Setup health checks
      if (this.config.enableHealthChecks) {
        this.setupHealthChecks(httpServer, wsServer);
      }

      // Setup monitoring
      if (this.config.enableMonitoring) {
        this.setupMonitoring(wsServer);
      }

      // Start server
      await new Promise<void>((resolve, reject) => {
        httpServer.listen(this.config.port, this.config.host, () => {
          console.log(`✅ Worker ${workerId} listening on ${this.config.host}:${this.config.port}`);
          resolve();
        });

        httpServer.on('error', (error) => {
          console.error(`❌ Worker ${workerId} failed to start:`, error);
          reject(error);
        });
      });

      // Send ready signal to primary
      if (cluster.worker) {
        cluster.worker.send({ type: 'ready', pid: process.pid });
      }

      // Setup graceful shutdown
      this.setupWorkerGracefulShutdown(httpServer, wsServer);

    } catch (error) {
      console.error(`❌ Worker ${workerId} startup failed:`, error);
      process.exit(1);
    }
  }

  // Handle messages from workers
  private handleWorkerMessage(worker: any, message: any): void {
    switch (message.type) {
      case 'ready':
        console.log(`✅ Worker ${message.pid} is ready`);
        break;
      case 'stats':
        console.log(`📊 Worker ${message.pid} stats:`, message.stats);
        break;
      case 'error':
        console.error(`❌ Worker ${message.pid} error:`, message.error);
        break;
    }
  }

  // Setup health checks
  private setupHealthChecks(httpServer: any, wsServer: any): void {
    httpServer.on('request', (req: any, res: any) => {
      if (req.url === '/health') {
        const stats = wsServer.getStats();
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          worker: {
            id: cluster.worker?.id || 'standalone',
            pid: process.pid
          },
          websocket: {
            totalClients: stats.totalClients,
            totalUsers: stats.totalUsers,
            uptime: process.uptime()
          },
          system: {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage()
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health, null, 2));
      } else if (req.url === '/metrics') {
        const stats = wsServer.getStats();
        const metrics = {
          websocket_connections_total: stats.totalClients,
          websocket_users_total: stats.totalUsers,
          websocket_uptime_seconds: process.uptime(),
          memory_heap_bytes: process.memoryUsage().heapUsed,
          memory_heap_total_bytes: process.memoryUsage().heapTotal,
          memory_external_bytes: process.memoryUsage().external,
          memory_rss_bytes: process.memoryUsage().rss
        };

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(Object.entries(metrics)
          .map(([key, value]) => `${key} ${value}`)
          .join('\n'));
      }
    });
  }

  // Setup monitoring
  private setupMonitoring(wsServer: any): void {
    // Monitor WebSocket connections
    setInterval(() => {
      const stats = wsServer.getStats();
      // monitoring.trackMetric('websocket_connections', stats.totalClients);
      // monitoring.trackMetric('websocket_users', stats.totalUsers);
      
      // Send stats to primary process
      if (cluster.worker) {
        cluster.worker.send({ 
          type: 'stats', 
          pid: process.pid, 
          stats: stats 
        });
      }
    }, 30000); // Every 30 seconds

    // Monitor memory usage
    setInterval(() => {
      const memUsage = process.memoryUsage();
      // monitoring.trackMetric('memory_heap_used', memUsage.heapUsed);
      // monitoring.trackMetric('memory_heap_total', memUsage.heapTotal);
      
      // Alert if memory usage is high
      if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        // monitoring.trackError(new Error('High memory usage detected'), {
        //   heapUsed: memUsage.heapUsed,
        //   heapTotal: memUsage.heapTotal
        // });
        console.warn('High memory usage detected:', {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal
        });
      }
    }, 60000); // Every minute
  }

  // Setup graceful shutdown for cluster
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`📡 Received ${signal}, shutting down cluster gracefully...`);
      this.isShuttingDown = true;

      // Send shutdown signal to all workers
      for (const worker of this.workers.values()) {
        worker.kill('SIGTERM');
      }

      // Wait for workers to exit
      const exitPromises = Array.from(this.workers.values()).map(worker => 
        new Promise<void>((resolve) => {
          worker.on('exit', () => resolve());
        })
      );

      await Promise.all(exitPromises);
      console.log('✅ Cluster shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  // Setup graceful shutdown for worker
  private setupWorkerGracefulShutdown(httpServer: any, wsServer: any): void {
    const shutdown = async (signal: string) => {
      console.log(`👷 Worker ${process.pid} received ${signal}, shutting down gracefully...`);

      // Stop accepting new connections
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
      });

      // Close WebSocket server
      wsServer.destroy();
      console.log('✅ WebSocket server closed');

      // Exit process
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Configuration
const config: ServerConfig = {
  port: parseInt(process.env.WEBSOCKET_PORT || '8080'),
  host: process.env.WEBSOCKET_HOST || '0.0.0.0',
  cluster: process.env.NODE_ENV === 'production',
  workers: parseInt(process.env.WEBSOCKET_WORKERS || os.cpus().length.toString()),
  enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
  enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false'
};

// Start the server
if (require.main === module) {
  const cluster = new PostPalWebSocketCluster(config);
  
  cluster.start().catch((error) => {
    console.error('❌ Failed to start WebSocket cluster:', error);
    process.exit(1);
  });
}

export { PostPalWebSocketCluster };