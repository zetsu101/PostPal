# PostPal Testing Guide

This guide covers comprehensive testing for PostPal's AI insights, WebSocket functionality, and integration features.

## 🧪 Test Suite Overview

PostPal includes a comprehensive testing suite that covers:

- **WebSocket Server Tests** - Connection, subscription, and real-time functionality
- **AI Insights Integration Tests** - API endpoints, caching, and WebSocket integration
- **Performance Tests** - Connection performance, API response times, and memory usage
- **End-to-End Tests** - Complete user workflows and system integration

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run All Tests

```bash
# Run comprehensive test suite
npm run test

# Run specific test suites
npm run test:websocket
npm run test:integration

# Run tests in watch mode (development)
npm run test:watch

# Run tests for CI/CD
npm run test:ci
```

### 3. Start Test Environment

```bash
# Start both Next.js and WebSocket server for testing
npm run dev:full
```

## 📋 Test Categories

### WebSocket Tests (`test:websocket`)

Tests the WebSocket server functionality:

- ✅ **Connection Establishment** - WebSocket connection with authentication
- ✅ **Authentication** - Token validation and user verification
- ✅ **Subscription Management** - Subscribe/unsubscribe to topics
- ✅ **Heartbeat** - Ping/pong connection health monitoring
- ✅ **Message Delivery** - Real-time insight updates
- ✅ **Multiple Connections** - Concurrent connection handling
- ✅ **Server Statistics** - Connection monitoring and metrics

### Integration Tests (`test:integration`)

Tests AI insights API with WebSocket integration:

- ✅ **Basic AI Insights** - Content analysis and scoring
- ✅ **WebSocket Integration** - Real-time updates during analysis
- ✅ **Caching Functionality** - Cache hit/miss performance
- ✅ **Rate Limiting** - API rate limit enforcement
- ✅ **Error Handling** - Invalid requests and error responses
- ✅ **Authentication** - Token validation and unauthorized access

### Performance Tests

Tests system performance and scalability:

- ✅ **WebSocket Connection Performance** - Multiple connection creation
- ✅ **API Performance** - Response time optimization
- ✅ **Caching Performance** - Cache effectiveness
- ✅ **Memory Usage** - Memory leak detection

## 🔧 Test Configuration

### Environment Variables

Create a `.env.test` file for testing:

```env
# Test WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8081
WEBSOCKET_PORT=8081
WEBSOCKET_PATH=/ws/insights

# Test Database (use test database)
SUPABASE_URL=your_test_supabase_url
SUPABASE_ANON_KEY=your_test_supabase_key

# Test AI Services (use mock services)
OPENAI_API_KEY=test_key
```

### Test Data

The test suite uses mock data for:

- **User Authentication** - Test user tokens and sessions
- **AI Services** - Mock AI responses for consistent testing
- **Database Operations** - Mock database calls
- **External APIs** - Mock external service responses

## 📊 Test Results

### Understanding Test Output

```
🧪 Starting WebSocket Test Suite...

📁 Connection Tests:
   ✅ Passed: 3
   ❌ Failed: 0
   ⏱️  Duration: 1250ms

   ✅ Connection Establishment: 450ms
   ✅ Authentication Failure: 300ms
   ✅ Multiple Connections: 500ms

📈 Summary:
   Total Tests: 8
   ✅ Passed: 8
   ❌ Failed: 0
   ⏱️  Total Duration: 3200ms
   📊 Success Rate: 100.0%
```

### Test Status Indicators

- ✅ **Passed** - Test completed successfully
- ❌ **Failed** - Test failed with error details
- ⚠️ **Warning** - Test passed but with warnings
- ⏱️ **Duration** - Test execution time

## 🐛 Debugging Tests

### Common Issues

1. **WebSocket Connection Failed**
   ```bash
   # Check if WebSocket server is running
   npm run dev:ws
   
   # Verify port availability
   lsof -i :8080
   ```

2. **Authentication Errors**
   ```bash
   # Check Supabase configuration
   echo $SUPABASE_URL
   echo $SUPABASE_ANON_KEY
   ```

3. **Test Timeouts**
   ```bash
   # Increase timeout in test files
   const timeout = 10000; // 10 seconds
   ```

### Debug Mode

Enable debug logging:

```bash
# Run tests with debug output
DEBUG=postpal:* npm run test

# Run specific test with verbose output
npm run test:websocket -- --verbose
```

### Test Isolation

Each test runs in isolation:

- **Fresh WebSocket connections** for each test
- **Mock services** reset between tests
- **Clean database state** for each test
- **Independent test data** per test case

## 🔄 Continuous Integration

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: PostPal Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test:ci
      env:
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### Pre-commit Hooks

Install husky for pre-commit testing:

```bash
npm install --save-dev husky lint-staged

# Add to package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["npm run lint", "npm run test"]
  }
}
```

## 📈 Performance Benchmarks

### Expected Performance

- **WebSocket Connection**: < 500ms
- **AI Insights API**: < 3000ms
- **Cached Requests**: < 100ms
- **Memory Usage**: < 50MB increase per test

### Performance Monitoring

```bash
# Run performance tests
npm run test -- --performance

# Monitor memory usage
npm run test -- --memory-check

# Load testing
npm run test -- --load-test
```

## 🧩 Custom Tests

### Adding New Tests

1. **Create test file**:
   ```typescript
   // src/lib/__tests__/my-feature-test.ts
   import { MyFeatureTest } from './my-feature-test';
   
   class MyFeatureTest {
     async testMyFeature(): Promise<TestResult> {
       // Test implementation
     }
   }
   ```

2. **Add to test runner**:
   ```typescript
   // src/lib/__tests__/test-runner.ts
   import { MyFeatureTest } from './my-feature-test';
   
   async runMyFeatureTests(): Promise<TestSuiteResult> {
     const testSuite = new MyFeatureTest();
     return await testSuite.runAllTests();
   }
   ```

3. **Add npm script**:
   ```json
   {
     "scripts": {
       "test:my-feature": "node -r ts-node/register src/lib/__tests__/my-feature-test.ts"
     }
   }
   ```

### Test Utilities

Useful utilities for testing:

```typescript
// Test data generators
export const generateTestContent = () => ({
  text: 'Test content for AI analysis',
  sentiment: 0.5,
  readability: 60,
  urgency: 0.2,
  callToAction: false,
  trendingTopics: ['Test'],
  scheduledTime: new Date().toISOString()
});

// Mock services
export const mockAIService = {
  calculateContentScore: jest.fn().mockReturnValue(85),
  predictEngagement: jest.fn().mockReturnValue({
    predictedEngagement: 0.75,
    confidence: 0.8,
    factors: { content: 0.8, timing: 0.7, audience: 0.8, trends: 0.6 }
  })
};

// Test assertions
export const assertWebSocketMessage = (message: any, expectedType: string) => {
  expect(message.type).toBe(expectedType);
  expect(message.timestamp).toBeDefined();
  expect(typeof message.timestamp).toBe('number');
};
```

## 📚 Test Documentation

### Writing Test Documentation

Each test should include:

1. **Test Purpose** - What the test validates
2. **Test Data** - Input data and expected output
3. **Dependencies** - Required services and mocks
4. **Edge Cases** - Error conditions and boundary tests
5. **Performance Expectations** - Expected execution time

### Example Test Documentation

```typescript
/**
 * Test: WebSocket Connection Establishment
 * 
 * Purpose: Validates that WebSocket connections are established
 *          successfully with proper authentication
 * 
 * Test Data:
 * - Valid token: 'test-token'
 * - Expected response: connection_established message
 * 
 * Dependencies:
 * - WebSocket server running on port 8081
 * - Mock Supabase authentication
 * 
 * Edge Cases:
 * - Invalid token rejection
 * - Connection timeout handling
 * - Multiple concurrent connections
 * 
 * Performance:
 * - Connection should establish within 500ms
 * - Should handle 10+ concurrent connections
 */
async testConnectionEstablishment(): Promise<TestResult> {
  // Test implementation
}
```

## 🎯 Best Practices

### Test Organization

- **Group related tests** in test suites
- **Use descriptive test names** that explain the purpose
- **Keep tests independent** - no shared state
- **Mock external dependencies** for consistent results
- **Test both success and failure cases**

### Test Data Management

- **Use consistent test data** across tests
- **Generate test data dynamically** when needed
- **Clean up test data** after each test
- **Use realistic data** that matches production

### Performance Testing

- **Set performance benchmarks** for each test
- **Monitor memory usage** during tests
- **Test with realistic data volumes**
- **Include load testing** for critical paths

## 🚨 Troubleshooting

### Test Failures

1. **Check test environment**:
   ```bash
   # Verify all services are running
   npm run dev:full
   
   # Check port availability
   netstat -an | grep 8080
   ```

2. **Review test logs**:
   ```bash
   # Run tests with verbose output
   npm run test -- --verbose
   
   # Check specific test
   npm run test:websocket -- --grep "Connection Establishment"
   ```

3. **Reset test environment**:
   ```bash
   # Clear test cache
   npm run test -- --clear-cache
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Common Solutions

- **Port conflicts**: Change WebSocket port in test configuration
- **Authentication issues**: Verify Supabase test credentials
- **Timeout errors**: Increase timeout values in test files
- **Memory issues**: Reduce test data size or increase memory limits

## 📞 Support

For testing issues:

1. **Check this guide** for common solutions
2. **Review test logs** for specific error messages
3. **Check GitHub issues** for known problems
4. **Create new issue** with test output and environment details

---

**Happy Testing! 🧪✨**

Your PostPal platform now has comprehensive testing coverage for all critical functionality!
