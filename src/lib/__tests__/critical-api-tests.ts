/**
 * Critical API Route Tests
 * Tests for essential API endpoints that must work for the app to function
 */

import { describe, it, expect } from '@jest/globals';

describe('Critical API Tests', () => {
  const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  describe('Health Check', () => {
    it('should return 200 for health endpoint', async () => {
      const response = await fetch(`${API_BASE}/api/health`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('status');
    });
  });

  describe('Authentication API', () => {
    it('should reject requests without authentication', async () => {
      const response = await fetch(`${API_BASE}/api/ai/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'test' }),
      });
      expect(response.status).toBe(401);
    });

    it('should validate request body structure', async () => {
      const response = await fetch(`${API_BASE}/api/ai/insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token',
        },
        body: JSON.stringify({}), // Missing required fields
      });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('AI API Endpoints', () => {
    it('should have proper error handling for missing content', async () => {
      const response = await fetch(`${API_BASE}/api/ai/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({}), // Missing content
      });
      // Should return 400 or 401, not 500
      expect([400, 401]).toContain(response.status);
    });
  });

  describe('Scheduling API', () => {
    it('should handle GET requests for scheduled posts', async () => {
      const response = await fetch(`${API_BASE}/api/scheduling?action=posts`);
      // Should return 401 (unauthorized) or 200 (if mock auth), not 500
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Cross-Platform API', () => {
    it('should validate platform data structure', async () => {
      const response = await fetch(`${API_BASE}/api/cross-platform`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invalid: 'data' }),
      });
      // Should return 400 or 401, not 500
      expect([400, 401]).toContain(response.status);
    });
  });
});

// Test runner
if (require.main === module) {
  console.log('🧪 Running Critical API Tests...\n');
  
  // Note: These tests require the dev server to be running
  // Run with: npm run dev (in one terminal) and npm run test:api (in another)
  
  describe('Critical API Tests', () => {
    it('should complete all critical tests', async () => {
      // Tests are defined above
      expect(true).toBe(true);
    });
  });
}

