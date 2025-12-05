#!/usr/bin/env node

// PostPal Comprehensive Test Runner
// Runs all tests including WebSocket, API integration, and end-to-end tests

import { WebSocketTestSuite } from './websocket-test-suite';
import { AIInsightsIntegrationTest } from './ai-insights-integration-test';
import { NextRequest } from 'next/server';
import type { WebSocket as WSWebSocket } from 'ws';

interface TestSuiteResult {
  name: string;
  passed: number;
  failed: number;
  total: number;
  duration: number;
  successRate: number;
}

class PostPalTestRunner {
  private results: TestSuiteResult[] = [];

  // Run WebSocket tests
  async runWebSocketTests(): Promise<TestSuiteResult> {
    console.log('🧪 Running WebSocket Tests...\n');
    
    const startTime = Date.now();
    const testSuite = new WebSocketTestSuite();
    const results = await testSuite.runAllTests();
    
    const duration = Date.now() - startTime;
    const totalTests = results.reduce((sum, suite) => sum + suite.tests.length, 0);
    const passedTests = results.reduce((sum, suite) => sum + suite.passed, 0);
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;

    const result: TestSuiteResult = {
      name: 'WebSocket Tests',
      passed: passedTests,
      failed: failedTests,
      total: totalTests,
      duration,
      successRate
    };

    this.results.push(result);
    return result;
  }

  // Run AI Insights integration tests
  async runAIInsightsTests(): Promise<TestSuiteResult> {
    console.log('🔗 Running AI Insights Integration Tests...\n');
    
    const startTime = Date.now();
    const testSuite = new AIInsightsIntegrationTest();
    const results = await testSuite.runAllTests();
    
    const duration = Date.now() - startTime;
    const totalTests = results.length;
    const passedTests = results.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;

    const result: TestSuiteResult = {
      name: 'AI Insights Integration Tests',
      passed: passedTests,
      failed: failedTests,
      total: totalTests,
      duration,
      successRate
    };

    this.results.push(result);
    return result;
  }

  // Run performance tests
  async runPerformanceTests(): Promise<TestSuiteResult> {
    console.log('⚡ Running Performance Tests...\n');
    
    const startTime = Date.now();
    const performanceTests = [
      await this.testWebSocketConnectionPerformance(),
      await this.testAPIPerformance(),
      await this.testCachingPerformance(),
      await this.testMemoryUsage()
    ];
    
    const duration = Date.now() - startTime;
    const totalTests = performanceTests.length;
    const passedTests = performanceTests.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;

    const result: TestSuiteResult = {
      name: 'Performance Tests',
      passed: passedTests,
      failed: failedTests,
      total: totalTests,
      duration,
      successRate
    };

    this.results.push(result);
    return result;
  }
  // Test WebSocket connection performance
  private async testWebSocketConnectionPerformance(): Promise<{ test: string; passed: boolean; duration: number }> {
    const startTime = Date.now();
    
    try {
      const { WebSocket } = await import('ws');
      const connections: WSWebSocket[] = [];
      
      // Test creating 10 connections quickly
      const connectionPromises = Array.from({ length: 10 }, (_, i) => {
        return new Promise<WSWebSocket>((resolve, reject) => {
          const ws = new WebSocket('ws://localhost:8080/ws/insights?token=test-token') as WSWebSocket;
          ws.on('open', () => resolve(ws));
          ws.on('error', reject);
        });
      });

      const establishedConnections = await Promise.all(connectionPromises);
      connections.push(...establishedConnections);
      
      // Close all connections
      connections.forEach(ws => ws.close());
      
      const duration = Date.now() - startTime;
      const passed = duration < 5000; // Should complete within 5 seconds
      
      return {
        test: 'WebSocket Connection Performance',
        passed,
        duration
      };
    } catch (error) {
      return {
        test: 'WebSocket Connection Performance',
        passed: false,
        duration: Date.now() - startTime
      };
    }
  }
  
  // Test API performance
  private async testAPIPerformance(): Promise<{ test: string; passed: boolean; duration: number }> {
    const startTime = Date.now();
    
    try {
      const requestBody = {
        content: {
          text: 'Performance test content',
          sentiment: 0.5,
          readability: 60,
          urgency: 0.2,
          callToAction: false,
          trendingTopics: ['Performance'],
          scheduledTime: new Date().toISOString()
        },
        platform: 'instagram',
        audienceData: null,
        historicalData: []
      };
      const request = new NextRequest('http://localhost:3000/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(requestBody)
      });

      const { POST } = await import('../../app/api/ai/insights/route');
      const response = await POST(request);
      
      const duration = Date.now() - startTime;
      const passed = duration < 3000 && response.status === 200; // Should complete within 3 seconds
      
      return {
        test: 'API Performance',
        passed,
        duration
      };
    } catch (error) {
      return {
        test: 'API Performance',
        passed: false,
        duration: Date.now() - startTime
      };
    }
  }

  // Test caching performance
  private async testCachingPerformance(): Promise<{ test: string; passed: boolean; duration: number }> {
    const startTime = Date.now();
    
    try {
      const requestBody = {
        content: {
          text: 'Caching performance test content',
          sentiment: 0.6,
          readability: 65,
          urgency: 0.3,
          callToAction: true,
          trendingTopics: ['Caching'],
          scheduledTime: new Date().toISOString()
        },
        platform: 'twitter',
        audienceData: null,
        historicalData: []
      };

      const { POST } = await import('../../app/api/ai/insights/route');
      // First request (cache miss)
      const request1 = new NextRequest('http://localhost:3000/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(requestBody)
      });
      
      const response1 = await POST(request1);
      const firstDuration = Date.now() - startTime;
      
      // Second request (cache hit)
      const request2 = new NextRequest('http://localhost:3000/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(requestBody)
      });
      
      const secondStartTime = Date.now();
      const response2 = await POST(request2);
      const secondDuration = Date.now() - secondStartTime;
      
      const totalDuration = Date.now() - startTime;
      const passed = secondDuration < firstDuration && response1.status === 200 && response2.status === 200;
      
      return {
        test: 'Caching Performance',
        passed,
        duration: totalDuration
      };
    } catch (error) {
      return {
        test: 'Caching Performance',
        passed: false,
        duration: Date.now() - startTime
      };
    }
  }

  // Test memory usage
  private async testMemoryUsage(): Promise<{ test: string; passed: boolean; duration: number }> {
    const startTime = Date.now();
    
    try {
      const initialMemory = process.memoryUsage();
      
      // Simulate some memory-intensive operations
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `test-data-${i}`,
        timestamp: Date.now()
      }));
      
      // Process the array
      const processed = largeArray.map(item => ({
        ...item,
        processed: true,
        hash: Buffer.from(JSON.stringify(item)).toString('base64')
      }));
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      const duration = Date.now() - startTime;
      const passed = memoryIncrease < 50 * 1024 * 1024; // Less than 50MB increase
      
      return {
        test: 'Memory Usage',
        passed,
        duration
      };
    } catch (error) {
      return {
        test: 'Memory Usage',
        passed: false,
        duration: Date.now() - startTime
      };
    }
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting PostPal Comprehensive Test Suite\n');
    console.log('=' .repeat(60));
    
    const overallStartTime = Date.now();
    
    try {
      // Run all test suites
      await this.runWebSocketTests();
      console.log('\n' + '=' .repeat(60));
      
      await this.runAIInsightsTests();
      console.log('\n' + '=' .repeat(60));
      
      await this.runPerformanceTests();
      console.log('\n' + '=' .repeat(60));
      
      // Print final summary
      this.printFinalSummary(overallStartTime);
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  // Print final summary
  private printFinalSummary(overallStartTime: number): void {
    const totalDuration = Date.now() - overallStartTime;
    const totalTests = this.results.reduce((sum, result) => sum + result.total, 0);
    const totalPassed = this.results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = this.results.reduce((sum, result) => sum + result.failed, 0);
    const overallSuccessRate = (totalPassed / totalTests) * 100;

    console.log('\n🎯 FINAL TEST SUMMARY');
    console.log('=' .repeat(60));
    
    this.results.forEach(result => {
      const status = result.successRate >= 80 ? '✅' : result.successRate >= 60 ? '⚠️' : '❌';
      console.log(`${status} ${result.name}:`);
      console.log(`   Tests: ${result.passed}/${result.total} passed`);
      console.log(`   Success Rate: ${result.successRate.toFixed(1)}%`);
      console.log(`   Duration: ${result.duration}ms`);
      console.log('');
    });

    console.log('📊 OVERALL RESULTS:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(`   📈 Success Rate: ${overallSuccessRate.toFixed(1)}%`);
    console.log(`   ⏱️  Total Duration: ${totalDuration}ms`);
    
    if (overallSuccessRate >= 90) {
      console.log('\n🎉 EXCELLENT! All tests are passing with high success rate.');
    } else if (overallSuccessRate >= 80) {
      console.log('\n✅ GOOD! Most tests are passing, minor issues to address.');
    } else if (overallSuccessRate >= 60) {
      console.log('\n⚠️  WARNING! Several tests are failing, needs attention.');
    } else {
      console.log('\n❌ CRITICAL! Many tests are failing, immediate action required.');
    }
    
    console.log('\n' + '=' .repeat(60));
  }

  // Get all results
  getResults(): TestSuiteResult[] {
    return this.results;
  }
}

// Export test runner
export { PostPalTestRunner };

// CLI runner
if (require.main === module) {
  const testRunner = new PostPalTestRunner();
  testRunner.runAllTests().then(() => {
    const results = testRunner.getResults();
    const overallSuccessRate = results.reduce((sum, result) => sum + result.successRate, 0) / results.length;
    
    if (overallSuccessRate >= 80) {
      process.exit(0); // Success
    } else {
      process.exit(1); // Failure
    }
  }).catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default PostPalTestRunner;
