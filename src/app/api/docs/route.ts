import { NextRequest } from 'next/server';
import { getSwaggerSpec } from '@/lib/swagger-config';
import { APIResponse } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    const spec = getSwaggerSpec();
    return APIResponse.success(spec, 'API documentation generated successfully');
  } catch (error) {
    console.error('Failed to generate API docs:', error);
    return APIResponse.serverError('Failed to generate API documentation');
  }
}
