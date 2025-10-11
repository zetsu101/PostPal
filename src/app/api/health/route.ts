import { NextRequest } from 'next/server';
import { healthCheck } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    return healthCheck();
  } catch (error) {
    console.error('Health check failed:', error);
    return healthCheck();
  }
}
