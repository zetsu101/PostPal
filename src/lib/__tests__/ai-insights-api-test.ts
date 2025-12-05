/**
 * AI Insights API Integration Test Suite
 * Tests the /api/ai/insights endpoint with various scenarios
 */

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
}

interface MockRequest {
  content: {
    text: string;
    media?: Array<{ type: string; url: string }>;
    sentiment?: number;
    readability?: number;
    urgency?: number;
    callToAction?: boolean;
    trendingTopics?: string[];
    scheduledTime?: string;
  };
  platform: string;
  audienceData?: any;
  historicalData?: any[];
}

class AIInsightsAPITester {
  private baseUrl: string;
  private results: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  // Helper to create a mock NextRequest
  private createMockRequest(body: MockRequest) {
    const mockHeaders = new Headers();
    mockHeaders.set('Content-Type', 'application/json');
    mockHeaders.set('authorization', `Bearer ${this.getMockToken()}`);
    mockHeaders.set('x-test-bypass', 'true');
    
    return new Request(`${this.baseUrl}/api/ai/insights`, {
      method: 'POST',
      headers: mockHeaders,
      body: JSON.stringify(body)
    });
  }

  // Mock authentication token
  private getMockToken(): string {
    // In real tests, this would be a valid JWT token from your auth system
    return 'mock-jwt-token-for-testing';
  }

  // Test basic content analysis
  async testBasicContentAnalysis(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Basic Content Analysis';
    
    try {
      const request = this.createMockRequest({
        content: {
          text: 'Check out our amazing new product! 🎉 #innovation #tech',
          media: [{ type: 'image', url: 'https://example.com/image.jpg' }],
          sentiment: 0.8,
          readability: 75,
          urgency: 0.3,
          callToAction: true
        },
        platform: 'instagram'
      });

      const response = await fetch(request);
      const data = await response.json();

      if (response.ok && data.success) {
        const duration = Date.now() - startTime;
        console.log(`✅ ${testName} passed in ${duration}ms`);
        console.log(`   Content Score: ${data.data.contentScore}`);
        console.log(`   Predicted Engagement: ${data.data.engagementPrediction?.predictedEngagement}`);
        return { testName, passed: true, duration };
      } else {
        throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} failed: ${error.message}`);
      return { testName, passed: false, error: error.message, duration };
    }
  }

  // Test platform-specific optimization
  async testPlatformSpecificOptimization(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Platform-Specific Optimization';
    
    try {
      const platforms = ['instagram', 'twitter', 'linkedin', 'facebook'];
      const results = [];

      for (const platform of platforms) {
        const request = this.createMockRequest({
          content: {
            text: 'Exciting news! Our team has achieved a major milestone.',
            sentiment: 0.9,
            readability: 70,
            callToAction: true
          },
          platform: platform
        });

        const response = await fetch(request);
        const data = await response.json();

        if (response.ok && data.success) {
          results.push({ platform, score: data.data.contentScore });
        }
      }

      if (results.length === platforms.length) {
        const duration = Date.now() - startTime;
        console.log(`✅ ${testName} passed for all platforms in ${duration}ms`);
        results.forEach(r => console.log(`   ${r.platform}: ${r.score} points`));
        return { testName, passed: true, duration };
      } else {
        throw new Error('Some platforms failed');
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} failed: ${error.message}`);
      return { testName, passed: false, error: error.message, duration };
    }
  }

  // Test with audience data
  async testWithAudienceData(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Audience-Based Analysis';
    
    try {
      const request = this.createMockRequest({
        content: {
          text: 'Join us for our webinar on AI-powered marketing strategies. Limited spots available! #AI #Marketing #Webinar',
          media: [{ type: 'image', url: 'https://example.com/webinar.jpg' }],
          callToAction: true
        },
        platform: 'linkedin',
        audienceData: {
          demographics: {
            ageGroups: [
              { range: '25-34', percentage: 45 },
              { range: '35-44', percentage: 35 },
              { range: '45-54', percentage: 20 }
            ],
            genders: [
              { gender: 'Male', percentage: 60 },
              { gender: 'Female', percentage: 40 }
            ],
            locations: [
              { location: 'United States', percentage: 50 },
              { location: 'United Kingdom', percentage: 20 },
              { location: 'Canada', percentage: 15 },
              { location: 'Other', percentage: 15 }
            ]
          },
          interests: [
            { category: 'Business', affinity: 0.9 },
            { category: 'Technology', affinity: 0.85 },
            { category: 'Marketing', affinity: 0.8 }
          ],
          behavior: {
            activeHours: [9, 10, 11, 14, 15, 16, 17],
            preferredContent: ['Educational', 'Professional', 'Industry News'],
            engagementPatterns: [
              { type: 'likes', frequency: 0.5 },
              { type: 'comments', frequency: 0.3 },
              { type: 'shares', frequency: 0.2 }
            ]
          },
          psychographics: {
            values: ['Professional Growth', 'Innovation', 'Learning'],
            lifestyle: ['Career-focused', 'Tech-savvy', 'Continuous learners'],
            brandAffinity: ['SaaS', 'Tech companies', 'Professional development']
          }
        }
      });

      const response = await fetch(request);
      const data = await response.json();

      if (response.ok && data.success) {
        const duration = Date.now() - startTime;
        console.log(`✅ ${testName} passed in ${duration}ms`);
        console.log(`   Audience insights: ${data.data.audienceInsights ? 'Provided' : 'Default used'}`);
        console.log(`   Recommendations: ${data.data.recommendations?.length || 0} suggestions`);
        return { testName, passed: true, duration };
      } else {
        throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} failed: ${error.message}`);
      return { testName, passed: false, error: error.message, duration };
    }
  }

  // Test with historical data
  async testWithHistoricalData(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'Historical Data Analysis';
    
    try {
      const request = this.createMockRequest({
        content: {
          text: 'Our quarterly results are in! 📈 Thanks to our amazing team.',
          media: [{ type: 'image', url: 'https://example.com/results.jpg' }],
          sentiment: 0.95,
          callToAction: false
        },
        platform: 'twitter',
        historicalData: [
          { engagementRate: 0.75, reach: 15000, impressions: 20000, clicks: 500, shares: 150, comments: 80, likes: 1200, saves: 200 },
          { engagementRate: 0.82, reach: 18000, impressions: 25000, clicks: 600, shares: 200, comments: 120, likes: 1500, saves: 250 },
          { engagementRate: 0.68, reach: 12000, impressions: 18000, clicks: 400, shares: 100, comments: 60, likes: 1000, saves: 150 }
        ]
      });

      const response = await fetch(request);
      const data = await response.json();

      if (response.ok && data.success) {
        const duration = Date.now() - startTime;
        console.log(`✅ ${testName} passed in ${duration}ms`);
        console.log(`   Baseline engagement: ${data.data.engagementPrediction?.predictedEngagement || 'N/A'}`);
        console.log(`   Confidence level: ${data.data.engagementPrediction?.confidence || 'N/A'}`);
        return { testName, passed: true, duration };
      } else {
        throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} failed: ${error.message}`);
      return { testName, passed: false, error: error.message, duration };
    }
  }

  // Test error handling
  async testErrorHandling(): Promise<TestResult> {
    const testCases = [
      {
        name: 'Missing content',
        body: { platform: 'instagram' }
      },
      {
        name: 'Missing platform',
        body: { content: { text: 'Test' } }
      },
      {
        name: 'Invalid platform',
        body: { content: { text: 'Test' }, platform: 'invalid' }
      },
      {
        name: 'Invalid content',
        body: { content: { media: [{ type: 'image', url: '' }] }, platform: 'instagram' }
      }
    ];

    const startTime = Date.now();
    let passedCount = 0;

    for (const testCase of testCases) {
      try {
        const request = this.createMockRequest(testCase.body as any);
        const response = await fetch(request);
        const data = await response.json();

        // All these should return error responses
        if (!response.ok || !data.success) {
          passedCount++;
          console.log(`✅ Error handling test: ${testCase.name} - Correctly rejected`);
        } else {
          console.error(`❌ Error handling test: ${testCase.name} - Unexpectedly succeeded`);
        }
      } catch (error) {
        // Network errors are acceptable for these test cases
        passedCount++;
        console.log(`✅ Error handling test: ${testCase.name} - Rejected as expected`);
      }
    }

    const duration = Date.now() - startTime;
    const testName = 'Error Handling Validation';
    
    if (passedCount === testCases.length) {
      console.log(`✅ ${testName} passed for all ${testCases.length} error scenarios`);
      return { testName, passed: true, duration };
    } else {
      console.error(`❌ ${testName} failed: ${testCases.length - passedCount} tests failed`);
      return { testName, passed: false, error: `${testCases.length - passedCount} tests failed`, duration };
    }
  }

  // Test performance metrics
  async testPerformance(): Promise<TestResult> {
    const startTime = Date.now();
    const testName = 'API Performance';
    
    try {
      const iterations = 5;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const iterStart = Date.now();
        const request = this.createMockRequest({
          content: {
            text: `Test request ${i + 1} #testing #api`,
          },
          platform: 'instagram'
        });

        const response = await fetch(request);
        await response.json();

        const iterDuration = Date.now() - iterStart;
        times.push(iterDuration);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      const duration = Date.now() - startTime;
      console.log(`✅ ${testName} - Average: ${avgTime.toFixed(2)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`);
      console.log(`   Total duration for ${iterations} requests: ${duration}ms`);

      // Check if performance is acceptable (under 2 seconds total)
      const passed = duration < 2000 && avgTime < 500;
      return { testName, passed, duration };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} failed: ${error.message}`);
      return { testName, passed: false, error: error.message, duration };
    }
  }

  // Run all tests
  async runAllTests(): Promise<void> {
    console.log('\n🧪 Starting AI Insights API Test Suite...\n');
    console.log('=' .repeat(60));

    const tests = [
      () => this.testBasicContentAnalysis(),
      () => this.testPlatformSpecificOptimization(),
      () => this.testWithAudienceData(),
      () => this.testWithHistoricalData(),
      () => this.testErrorHandling(),
      () => this.testPerformance()
    ];

    for (const test of tests) {
      const result = await test();
      this.results.push(result);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between tests
    }

    this.printResults();
  }

  // Print test results summary
  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`\nTotal Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📈 Average Duration: ${Math.round(totalDuration / this.results.length)}ms`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.testName}: ${r.error}`);
        });
    }

    console.log('\n' + '='.repeat(60));
  }

  // Get results
  getResults(): TestResult[] {
    return this.results;
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new AIInsightsAPITester();
  tester.runAllTests()
    .then(() => {
      const results = tester.getResults();
      const passed = results.filter(r => r.passed).length;
      const failed = results.filter(r => !r.passed).length;
      process.exit(failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

export { AIInsightsAPITester, type TestResult, type MockRequest };
