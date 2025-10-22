// WebSocket Testing Suite for PostPal
// Comprehensive tests for WebSocket server, client, and integration

import { WebSocket } from 'ws';
import { PostPalWebSocketServer } from '../lib/websocket-server';
import { WEBSOCKET_CONFIG, WEBSOCKET_MESSAGE_TYPES, WEBSOCKET_TOPICS } from '../lib/websocket-config';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  duration: number;
}

class WebSocketTestSuite {
  private server: PostPalWebSocketServer | null = null;
  private httpServer: any = null;
  private testResults: TestSuite[] = [];

  // Mock Supabase client for testing
  private mockSupabaseClient = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@postpal.com' } },
        error: null
      })
    }
  };

  // Start test server
  async startTestServer(): Promise<void> {
    const { createServer } = await import('http');
    this.httpServer = createServer();
    
    // Mock the Supabase import
    jest.doMock('@/lib/supabase', () => ({
      createServerClient: () => this.mockSupabaseClient
    }));

    this.server = new PostPalWebSocketServer(this.httpServer);
    
    return new Promise((resolve) => {
      this.httpServer.listen(8081, () => {
        console.log('Test WebSocket server started on port 8081');
        resolve();
      });
    });
  }

  // Stop test server
  async stopTestServer(): Promise<void> {
    if (this.server) {
      this.server.destroy();
    }
    if (this.httpServer) {
      this.httpServer.close();
    }
  }

  // Create WebSocket connection for testing
  private createTestConnection(token: string = 'test-token'): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:8081/ws/insights?token=${token}`);
      
      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
      
      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
  }

  // Wait for message with timeout
  private waitForMessage(ws: WebSocket, expectedType?: string, timeout: number = 2000): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, timeout);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (!expectedType || message.type === expectedType) {
            clearTimeout(timer);
            resolve(message);
          }
        } catch (error) {
          clearTimeout(timer);
          reject(error);
        }
      });
    });
  }

  // Test WebSocket connection establishment
  async testConnectionEstablishment(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const ws = await this.createTestConnection();
      
      // Wait for connection established message
      const message = await this.waitForMessage(ws, WEBSOCKET_MESSAGE_TYPES.CONNECTION_ESTABLISHED);
      
      ws.close();
      
      return {
        test: 'Connection Establishment',
        passed: message.type === WEBSOCKET_MESSAGE_TYPES.CONNECTION_ESTABLISHED,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: 'Connection Establishment',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test subscription functionality
  async testSubscription(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const ws = await this.createTestConnection();
      
      // Subscribe to topics
      ws.send(JSON.stringify({
        type: WEBSOCKET_MESSAGE_TYPES.SUBSCRIBE,
        topics: [WEBSOCKET_TOPICS.CONTENT_ANALYSIS, WEBSOCKET_TOPICS.ENGAGEMENT_PREDICTION]
      }));
      
      // Wait for subscription confirmation
      const message = await this.waitForMessage(ws, WEBSOCKET_MESSAGE_TYPES.SUBSCRIPTION_CONFIRMED);
      
      ws.close();
      
      const hasCorrectTopics = message.topics.includes(WEBSOCKET_TOPICS.CONTENT_ANALYSIS) &&
                              message.topics.includes(WEBSOCKET_TOPICS.ENGAGEMENT_PREDICTION);
      
      return {
        test: 'Subscription Management',
        passed: message.type === WEBSOCKET_MESSAGE_TYPES.SUBSCRIPTION_CONFIRMED && hasCorrectTopics,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: 'Subscription Management',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test unsubscription functionality
  async testUnsubscription(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const ws = await this.createTestConnection();
      
      // First subscribe
      ws.send(JSON.stringify({
        type: WEBSOCKET_MESSAGE_TYPES.SUBSCRIBE,
        topics: [WEBSOCKET_TOPICS.CONTENT_ANALYSIS]
      }));
      
      await this.waitForMessage(ws, WEBSOCKET_MESSAGE_TYPES.SUBSCRIPTION_CONFIRMED);
      
      // Then unsubscribe
      ws.send(JSON.stringify({
        type: WEBSOCKET_MESSAGE_TYPES.UNSUBSCRIBE,
        topics: [WEBSOCKET_TOPICS.CONTENT_ANALYSIS]
      }));
      
      // Wait for unsubscription confirmation
      const message = await this.waitForMessage(ws, WEBSOCKET_MESSAGE_TYPES.UNSUBSCRIPTION_CONFIRMED);
      
      ws.close();
      
      const topicRemoved = !message.topics.includes(WEBSOCKET_TOPICS.CONTENT_ANALYSIS);
      
      return {
        test: 'Unsubscription Management',
        passed: message.type === WEBSOCKET_MESSAGE_TYPES.UNSUBSCRIPTION_CONFIRMED && topicRemoved,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: 'Unsubscription Management',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test ping/pong heartbeat
  async testHeartbeat(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const ws = await this.createTestConnection();
      
      // Send ping
      ws.send(JSON.stringify({
        type: WEBSOCKET_MESSAGE_TYPES.PING
      }));
      
      // Wait for pong
      const message = await this.waitForMessage(ws, WEBSOCKET_MESSAGE_TYPES.PONG);
      
      ws.close();
      
      return {
        test: 'Heartbeat (Ping/Pong)',
        passed: message.type === WEBSOCKET_MESSAGE_TYPES.PONG,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: 'Heartbeat (Ping/Pong)',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test insight update delivery
  async testInsightUpdateDelivery(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const ws = await this.createTestConnection();
      
      // Subscribe to content analysis updates
      ws.send(JSON.stringify({
        type: WEBSOCKET_MESSAGE_TYPES.SUBSCRIBE,
        topics: [WEBSOCKET_TOPICS.CONTENT_ANALYSIS]
      }));
      
      await this.waitForMessage(ws, WEBSOCKET_MESSAGE_TYPES.SUBSCRIPTION_CONFIRMED);
      
      // Simulate sending an insight update
      if (this.server) {
        this.server.sendInsightUpdate({
          type: WEBSOCKET_TOPICS.CONTENT_ANALYSIS,
          userId: 'test-user-123',
          data: {
            contentScore: 85,
            features: { textLength: 150 },
            recommendations: ['Add more hashtags']
          },
          timestamp: Date.now(),
          priority: 'medium'
        });
      }
      
      // Wait for insight update
      const message = await this.waitForMessage(ws, WEBSOCKET_MESSAGE_TYPES.INSIGHT_UPDATE);
      
      ws.close();
      
      const hasCorrectData = message.data?.type === WEBSOCKET_TOPICS.CONTENT_ANALYSIS &&
                           message.data?.data?.contentScore === 85;
      
      return {
        test: 'Insight Update Delivery',
        passed: message.type === WEBSOCKET_MESSAGE_TYPES.INSIGHT_UPDATE && hasCorrectData,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: 'Insight Update Delivery',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test authentication failure
  async testAuthenticationFailure(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Mock authentication failure
      this.mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid token' }
      });
      
      const ws = new WebSocket('ws://localhost:8081/ws/insights?token=invalid-token');
      
      const connectionFailed = await new Promise<boolean>((resolve) => {
        ws.on('error', () => resolve(true));
        ws.on('open', () => resolve(false));
        
        setTimeout(() => resolve(true), 3000);
      });
      
      ws.close();
      
      return {
        test: 'Authentication Failure',
        passed: connectionFailed,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: 'Authentication Failure',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test multiple connections
  async testMultipleConnections(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const connections: WebSocket[] = [];
      const connectionPromises: Promise<WebSocket>[] = [];
      
      // Create 5 connections
      for (let i = 0; i < 5; i++) {
        connectionPromises.push(this.createTestConnection(`test-token-${i}`));
      }
      
      const establishedConnections = await Promise.all(connectionPromises);
      connections.push(...establishedConnections);
      
      // Wait a bit to ensure all connections are stable
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close all connections
      connections.forEach(ws => ws.close());
      
      return {
        test: 'Multiple Connections',
        passed: establishedConnections.length === 5,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: 'Multiple Connections',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test server statistics
  async testServerStatistics(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      if (!this.server) {
        throw new Error('Server not initialized');
      }
      
      const stats = this.server.getStats();
      
      const hasRequiredFields = stats.hasOwnProperty('totalClients') &&
                              stats.hasOwn('totalUsers') &&
                              stats.hasOwn('timestamp');
      
      return {
        test: 'Server Statistics',
        passed: hasRequiredFields,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        test: 'Server Statistics',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Run all tests
  async runAllTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting WebSocket Test Suite...\n');
    
    await this.startTestServer();
    
    const testSuites = [
      {
        name: 'Connection Tests',
        tests: [
          await this.testConnectionEstablishment(),
          await this.testAuthenticationFailure(),
          await this.testMultipleConnections()
        ]
      },
      {
        name: 'Subscription Tests',
        tests: [
          await this.testSubscription(),
          await this.testUnsubscription()
        ]
      },
      {
        name: 'Communication Tests',
        tests: [
          await this.testHeartbeat(),
          await this.testInsightUpdateDelivery()
        ]
      },
      {
        name: 'Server Tests',
        tests: [
          await this.testServerStatistics()
        ]
      }
    ];

    // Calculate results for each suite
    this.testResults = testSuites.map(suite => {
      const passed = suite.tests.filter(test => test.passed).length;
      const failed = suite.tests.length - passed;
      const duration = suite.tests.reduce((sum, test) => sum + test.duration, 0);
      
      return {
        ...suite,
        passed,
        failed,
        duration
      };
    });

    await this.stopTestServer();
    
    this.printResults();
    
    return this.testResults;
  }

  // Print test results
  private printResults(): void {
    console.log('\n📊 WebSocket Test Results:\n');
    
    this.testResults.forEach(suite => {
      console.log(`📁 ${suite.name}:`);
      console.log(`   ✅ Passed: ${suite.passed}`);
      console.log(`   ❌ Failed: ${suite.failed}`);
      console.log(`   ⏱️  Duration: ${suite.duration}ms\n`);
      
      suite.tests.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        const error = test.error ? ` (${test.error})` : '';
        console.log(`   ${status} ${test.test}: ${test.duration}ms${error}`);
      });
      
      console.log('');
    });

    const totalPassed = this.testResults.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.testResults.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = this.testResults.reduce((sum, suite) => sum + suite.duration, 0);

    console.log('📈 Summary:');
    console.log(`   Total Tests: ${totalPassed + totalFailed}`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(`   ⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`   📊 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%\n`);
  }

  // Get test results
  getResults(): TestSuite[] {
    return this.testResults;
  }
}

// Export test suite
export { WebSocketTestSuite };

// CLI runner for testing
if (require.main === module) {
  const testSuite = new WebSocketTestSuite();
  testSuite.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export default WebSocketTestSuite;
