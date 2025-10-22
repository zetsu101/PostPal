// AI Insights API Integration Tests
// Tests the complete flow from API request to WebSocket updates

import { NextRequest } from 'next/server';
import { POST as insightsHandler } from '../../app/api/ai/insights/route';
import { PostPalWebSocketServer } from '../websocket-server';
import { createServerClient } from '../supabase';

interface IntegrationTestResult {
  test: string;
  passed: boolean;
  error?: string;
  duration: number;
  details?: any;
}

class AIInsightsIntegrationTest {
  private server: PostPalWebSocketServer | null = null;
  private httpServer: any = null;
  private testResults: IntegrationTestResult[] = [];

  // Mock Supabase client
  private mockSupabaseClient = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123', email: 'test@postpal.com' } },
        error: null
      })
    }
  };

  // Mock AI services
  private mockAIServices = {
    contentScoringModel: {
      calculateContentScore: jest.fn().mockReturnValue(85)
    },
    engagementPredictionModel: {
      predictEngagement: jest.fn().mockReturnValue({
        predictedEngagement: 0.75,
        confidence: 0.8,
        factors: {
          content: 0.8,
          timing: 0.7,
          audience: 0.8,
          trends: 0.6
        },
        recommendations: ['Add more hashtags', 'Post during peak hours']
      })
    },
    optimalTimingModel: {
      analyzeOptimalTimes: jest.fn().mockReturnValue({
        bestTimes: [
          { hour: 9, day: 'Tuesday', score: 0.95 },
          { hour: 13, day: 'Wednesday', score: 0.92 }
        ],
        audienceActivity: [
          { hour: 9, activity: 1.0 },
          { hour: 13, activity: 0.9 }
        ],
        competitorAnalysis: []
      })
    },
    trendPredictionEngine: {
      predictTrends: jest.fn().mockResolvedValue({
        trendingTopics: [
          { topic: 'AI Content', growth: 25, confidence: 0.8 }
        ],
        emergingTrends: [
          { topic: 'Video Content', earlySignal: 0.7 }
        ],
        decliningTrends: [],
        seasonalPatterns: []
      })
    },
    audienceAnalysisEngine: {
      analyzeAudience: jest.fn().mockResolvedValue({
        demographics: {
          ageGroups: [
            { range: '25-34', percentage: 40 }
          ],
          genders: [
            { gender: 'Female', percentage: 55 }
          ],
          locations: [
            { location: 'United States', percentage: 35 }
          ]
        },
        interests: [
          { category: 'Technology', affinity: 0.7 }
        ],
        behavior: {
          activeHours: [9, 10, 11, 13, 14, 15],
          preferredContent: ['Educational', 'Behind-the-scenes'],
          engagementPatterns: [
            { type: 'likes', frequency: 0.6 }
          ]
        },
        psychographics: {
          values: ['Innovation', 'Efficiency'],
          lifestyle: ['Tech-savvy'],
          brandAffinity: ['SaaS']
        }
      })
    }
  };

  // Start test environment
  async startTestEnvironment(): Promise<void> {
    const { createServer } = await import('http');
    this.httpServer = createServer();
    
    // Mock dependencies
    jest.doMock('@/lib/supabase', () => ({
      createServerClient: () => this.mockSupabaseClient,
      DatabaseService: {
        createAIOptimization: jest.fn().mockResolvedValue({})
      }
    }));

    jest.doMock('@/lib/ai-ml-models', () => this.mockAIServices);
    jest.doMock('@/lib/trend-prediction-engine', () => ({
      trendPredictionEngine: this.mockAIServices.trendPredictionEngine
    }));
    jest.doMock('@/lib/audience-analysis-engine', () => ({
      audienceAnalysisEngine: this.mockAIServices.audienceAnalysisEngine
    }));

    this.server = new PostPalWebSocketServer(this.httpServer);
    
    return new Promise((resolve) => {
      this.httpServer.listen(8082, () => {
        console.log('Integration test server started on port 8082');
        resolve();
      });
    });
  }

  // Stop test environment
  async stopTestEnvironment(): Promise<void> {
    if (this.server) {
      this.server.destroy();
    }
    if (this.httpServer) {
      this.httpServer.close();
    }
  }

  // Create test request
  private createTestRequest(body: any, token: string = 'test-token'): NextRequest {
    const request = new NextRequest('http://localhost:3000/api/ai/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    return request;
  }

  // Test basic AI insights generation
  async testBasicInsightsGeneration(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      const requestBody = {
        content: {
          text: 'Check out our new AI-powered social media tool! #AI #SocialMedia #Innovation',
          sentiment: 0.8,
          readability: 70,
          urgency: 0.3,
          callToAction: true,
          trendingTopics: ['AI', 'SocialMedia'],
          scheduledTime: new Date().toISOString()
        },
        platform: 'instagram',
        audienceData: null,
        historicalData: []
      };

      const request = this.createTestRequest(requestBody);
      const response = await insightsHandler(request);
      const data = await response.json();

      const hasRequiredFields = data.success &&
                               data.data.contentScore !== undefined &&
                               data.data.engagementPrediction !== undefined &&
                               data.data.recommendations !== undefined;

      return {
        test: 'Basic AI Insights Generation',
        passed: hasRequiredFields,
        duration: Date.now() - startTime,
        details: {
          statusCode: response.status,
          hasContentScore: data.data.contentScore !== undefined,
          hasEngagementPrediction: data.data.engagementPrediction !== undefined,
          hasRecommendations: data.data.recommendations !== undefined
        }
      };
    } catch (error) {
      return {
        test: 'Basic AI Insights Generation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test WebSocket integration
  async testWebSocketIntegration(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      // Create WebSocket connection
      const { WebSocket } = await import('ws');
      const ws = new WebSocket('ws://localhost:8082/ws/insights?token=test-token');
      
      const connectionPromise = new Promise<void>((resolve, reject) => {
        ws.on('open', () => resolve());
        ws.on('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });

      await connectionPromise;

      // Subscribe to updates
      ws.send(JSON.stringify({
        type: 'subscribe',
        topics: ['content_analysis', 'engagement_prediction']
      }));

      // Wait for subscription confirmation
      const subscriptionPromise = new Promise<any>((resolve, reject) => {
        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.type === 'subscription_confirmed') {
              resolve(message);
            }
          } catch (error) {
            reject(error);
          }
        });
        setTimeout(() => reject(new Error('Subscription timeout')), 3000);
      });

      await subscriptionPromise;

      // Make API request
      const requestBody = {
        content: {
          text: 'Testing WebSocket integration with AI insights!',
          sentiment: 0.7,
          readability: 65,
          urgency: 0.4,
          callToAction: false,
          trendingTopics: ['Testing'],
          scheduledTime: new Date().toISOString()
        },
        platform: 'twitter',
        audienceData: null,
        historicalData: []
      };

      const request = this.createTestRequest(requestBody);
      const response = await insightsHandler(request);

      // Wait for WebSocket updates
      const updatesPromise = new Promise<any[]>((resolve, reject) => {
        const updates: any[] = [];
        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            if (message.type === 'insight_update') {
              updates.push(message);
              if (updates.length >= 2) { // Expect at least 2 updates
                resolve(updates);
              }
            }
          } catch (error) {
            reject(error);
          }
        });
        setTimeout(() => resolve(updates), 5000); // Resolve with whatever we got
      });

      const updates = await updatesPromise;
      ws.close();

      const hasUpdates = updates.length > 0;
      const hasContentAnalysisUpdate = updates.some(u => u.data.type === 'content_analysis');
      const hasEngagementUpdate = updates.some(u => u.data.type === 'engagement_prediction');

      return {
        test: 'WebSocket Integration',
        passed: hasUpdates && hasContentAnalysisUpdate && hasEngagementUpdate,
        duration: Date.now() - startTime,
        details: {
          updatesReceived: updates.length,
          hasContentAnalysisUpdate,
          hasEngagementUpdate,
          apiResponseStatus: response.status
        }
      };
    } catch (error) {
      return {
        test: 'WebSocket Integration',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test caching functionality
  async testCachingFunctionality(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      const requestBody = {
        content: {
          text: 'Testing caching with identical content!',
          sentiment: 0.6,
          readability: 60,
          urgency: 0.2,
          callToAction: true,
          trendingTopics: ['Caching'],
          scheduledTime: new Date().toISOString()
        },
        platform: 'linkedin',
        audienceData: null,
        historicalData: []
      };

      // First request
      const request1 = this.createTestRequest(requestBody);
      const response1 = await insightsHandler(request1);
      const data1 = await response1.json();

      // Second identical request
      const request2 = this.createTestRequest(requestBody);
      const response2 = await insightsHandler(request2);
      const data2 = await response2.json();

      // Both should succeed
      const bothSuccessful = data1.success && data2.success;
      
      // Content scores should be identical (cached)
      const scoresMatch = data1.data.contentScore === data2.data.contentScore;

      return {
        test: 'Caching Functionality',
        passed: bothSuccessful && scoresMatch,
        duration: Date.now() - startTime,
        details: {
          firstRequestSuccess: data1.success,
          secondRequestSuccess: data2.success,
          scoresMatch,
          firstScore: data1.data.contentScore,
          secondScore: data2.data.contentScore
        }
      };
    } catch (error) {
      return {
        test: 'Caching Functionality',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test rate limiting
  async testRateLimiting(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      const requestBody = {
        content: {
          text: 'Testing rate limiting!',
          sentiment: 0.5,
          readability: 55,
          urgency: 0.1,
          callToAction: false,
          trendingTopics: ['RateLimit'],
          scheduledTime: new Date().toISOString()
        },
        platform: 'facebook',
        audienceData: null,
        historicalData: []
      };

      const requests = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 15; i++) {
        const request = this.createTestRequest(requestBody);
        requests.push(insightsHandler(request));
      }

      const responses = await Promise.all(requests);
      
      // Check for rate limiting responses
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      const successfulResponses = responses.filter(r => r.status === 200);

      const hasRateLimiting = rateLimitedResponses.length > 0;
      const hasSuccessfulRequests = successfulResponses.length > 0;

      return {
        test: 'Rate Limiting',
        passed: hasRateLimiting && hasSuccessfulRequests,
        duration: Date.now() - startTime,
        details: {
          totalRequests: responses.length,
          rateLimitedResponses: rateLimitedResponses.length,
          successfulResponses: successfulResponses.length,
          hasRateLimiting,
          hasSuccessfulRequests
        }
      };
    } catch (error) {
      return {
        test: 'Rate Limiting',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test error handling
  async testErrorHandling(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      // Test with invalid request body
      const invalidRequest = this.createTestRequest({
        content: {
          // Missing required text field
          sentiment: 0.5
        },
        platform: 'invalid-platform'
      });

      const response = await insightsHandler(invalidRequest);
      const data = await response.json();

      const hasError = !data.success && response.status >= 400;
      const hasErrorMessage = data.error && data.error.message;

      return {
        test: 'Error Handling',
        passed: hasError && hasErrorMessage,
        duration: Date.now() - startTime,
        details: {
          statusCode: response.status,
          hasError,
          hasErrorMessage,
          errorMessage: data.error?.message
        }
      };
    } catch (error) {
      return {
        test: 'Error Handling',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Test authentication
  async testAuthentication(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    
    try {
      // Mock authentication failure
      this.mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid token' }
      });

      const requestBody = {
        content: {
          text: 'Testing authentication!',
          sentiment: 0.5,
          readability: 60,
          urgency: 0.2,
          callToAction: false,
          trendingTopics: ['Auth'],
          scheduledTime: new Date().toISOString()
        },
        platform: 'instagram',
        audienceData: null,
        historicalData: []
      };

      const request = this.createTestRequest(requestBody, 'invalid-token');
      const response = await insightsHandler(request);
      const data = await response.json();

      const isUnauthorized = response.status === 401;
      const hasErrorMessage = data.error && data.error.message;

      return {
        test: 'Authentication',
        passed: isUnauthorized && hasErrorMessage,
        duration: Date.now() - startTime,
        details: {
          statusCode: response.status,
          isUnauthorized,
          hasErrorMessage,
          errorMessage: data.error?.message
        }
      };
    } catch (error) {
      return {
        test: 'Authentication',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  // Run all integration tests
  async runAllTests(): Promise<IntegrationTestResult[]> {
    console.log('🔗 Starting AI Insights Integration Tests...\n');
    
    await this.startTestEnvironment();
    
    const tests = [
      await this.testBasicInsightsGeneration(),
      await this.testWebSocketIntegration(),
      await this.testCachingFunctionality(),
      await this.testRateLimiting(),
      await this.testErrorHandling(),
      await this.testAuthentication()
    ];

    this.testResults = tests;
    
    await this.stopTestEnvironment();
    
    this.printResults();
    
    return this.testResults;
  }

  // Print test results
  private printResults(): void {
    console.log('\n📊 AI Insights Integration Test Results:\n');
    
    const passed = this.testResults.filter(test => test.passed).length;
    const failed = this.testResults.length - passed;
    const totalDuration = this.testResults.reduce((sum, test) => sum + test.duration, 0);

    this.testResults.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      const error = test.error ? ` (${test.error})` : '';
      console.log(`${status} ${test.test}: ${test.duration}ms${error}`);
      
      if (test.details) {
        console.log(`   Details: ${JSON.stringify(test.details, null, 2)}`);
      }
    });

    console.log('\n📈 Summary:');
    console.log(`   Total Tests: ${this.testResults.length}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`   📊 Success Rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%\n`);
  }

  // Get test results
  getResults(): IntegrationTestResult[] {
    return this.testResults;
  }
}

// Export test suite
export { AIInsightsIntegrationTest };

// CLI runner for testing
if (require.main === module) {
  const testSuite = new AIInsightsIntegrationTest();
  testSuite.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Integration test suite failed:', error);
    process.exit(1);
  });
}

export default AIInsightsIntegrationTest;
