/**
 * Standalone Test Runner for AI Insights API
 * Can be run directly with ts-node
 */

import { AIInsightsAPITester } from './ai-insights-api-test';

async function runTests() {
  console.log('\n🧪 AI Insights API Test Suite');
  console.log('================================\n');
  
  const tester = new AIInsightsAPITester('http://localhost:3000');
  
  try {
    await tester.runAllTests();
    
    const results = tester.getResults();
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    if (failed > 0) {
      console.log('\n⚠️  Some tests failed. Make sure:');
      console.log('   1. The Next.js dev server is running (npm run dev)');
      console.log('   2. Supabase is configured and running');
      console.log('   3. WebSocket server is running (npm run dev:ws)');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

runTests();
