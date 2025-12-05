# AI Insights API Test Suite

This directory contains comprehensive tests for the AI Insights API endpoint and related functionality.

## Test Files

### 1. **ai-insights-api-test.ts**
Standalone API integration tests that test the `/api/ai/insights` endpoint with various scenarios:
- Basic content analysis
- Platform-specific optimization
- Audience-based analysis
- Historical data analysis
- Error handling
- Performance testing

### 2. **ai-insights-integration-test.ts**
Integration tests that test the complete flow including:
- AI insights generation
- WebSocket integration
- Caching functionality
- Rate limiting
- Error handling
- Authentication

### 3. **websocket-test-suite.ts**
WebSocket-specific tests for real-time features.

### 4. **run-api-tests.ts**
Test runner script for the API tests.

## Running the Tests

### Prerequisites

Make sure your development servers are running:

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start WebSocket server
npm run dev:ws

# Or start both at once:
npm run dev:full
```

### Run API Tests

```bash
# Run API integration tests
npm run test:api

# Run integration tests
npm run test:integration

# Run WebSocket tests
npm run test:websocket
```

## Test Scenarios

### Basic Content Analysis Test
Tests the AI insights API with a simple Instagram post:
- Content: "Check out our amazing new product! 🎉 #innovation #tech"
- Platform: Instagram
- Expected: Content score, engagement prediction, recommendations

### Platform-Specific Optimization Test
Tests optimization for multiple platforms:
- Instagram
- Twitter
- LinkedIn
- Facebook

### Audience-Based Analysis Test
Tests with detailed audience data:
- Demographics (age, gender, location)
- Interests and behavior patterns
- Psychographics

### Historical Data Test
Tests with historical performance data:
- Previous engagement rates
- Performance trends
- Baseline calculations

### Error Handling Test
Tests validation and error responses:
- Missing content
- Missing platform
- Invalid platform
- Invalid content

### Performance Test
Tests API performance with multiple requests:
- Average response time
- Min/Max response times
- Concurrent request handling

## Expected Output

When tests pass, you'll see output like:

```
🧪 Starting AI Insights API Test Suite...

============================================================
✅ Basic Content Analysis passed in 245ms
   Content Score: 85
   Predicted Engagement: 0.75

✅ Platform-Specific Optimization passed for all platforms in 1205ms
   instagram: 87 points
   twitter: 82 points
   linkedin: 90 points
   facebook: 85 points

✅ Audience-Based Analysis passed in 312ms
   Audience insights: Provided
   Recommendations: 6 suggestions

...

============================================================
📊 Test Results Summary
============================================================

Total Tests: 6
✅ Passed: 6
❌ Failed: 0
⏱️  Total Duration: 3245ms
📈 Average Duration: 541ms
```

## Troubleshooting

### Tests Fail to Connect

**Error**: `Failed to connect to http://localhost:3000`

**Solution**: Make sure the dev server is running:
```bash
npm run dev
```

### Authentication Errors

**Error**: `Invalid or expired token`

**Solution**: The tests use mock tokens. In a real environment, you'll need to configure proper authentication.

### WebSocket Connection Errors

**Error**: `WebSocket connection failed`

**Solution**: Make sure the WebSocket server is running:
```bash
npm run dev:ws
```

## Writing New Tests

To add new test scenarios:

1. Open `ai-insights-api-test.ts`
2. Add a new test method to the `AIInsightsAPITester` class
3. Add the test method to the `runAllTests()` array
4. Run with `npm run test:api`

Example test method:

```typescript
async testCustomScenario(): Promise<TestResult> {
  const startTime = Date.now();
  const testName = 'Custom Scenario';
  
  try {
    const request = this.createMockRequest({
      content: {
        text: 'Your test content here',
        // ... other content fields
      },
      platform: 'instagram'
    });

    const response = await fetch(request);
    const data = await response.json();

    if (response.ok && data.success) {
      const duration = Date.now() - startTime;
      console.log(`✅ ${testName} passed in ${duration}ms`);
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
```

## CI/CD Integration

These tests can be integrated into your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Run Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run test:api
      - run: npm run test:integration
```

## Next Steps

After running the tests successfully, you can:

1. **Integrate frontend components** - Connect the AI insights to the dashboard
2. **Set up production environment** - Configure environment variables
3. **User testing** - Gather feedback on the AI features
4. **Performance optimization** - Monitor and optimize API performance
