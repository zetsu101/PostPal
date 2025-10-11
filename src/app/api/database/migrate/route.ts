import { NextRequest, NextResponse } from 'next/server';
import { MigrationService } from '@/lib/migration';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Database migration API called');
    
    const result = await MigrationService.migrateAll();
    
    if (result.success) {
      // Mark migration as completed
      MigrationService.markMigrationCompleted();
      
      return NextResponse.json({
        success: true,
        message: 'Migration completed successfully',
        userId: result.userId
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Migration API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const needsMigration = MigrationService.needsMigration();
    
    return NextResponse.json({
      needsMigration,
      message: needsMigration ? 'Migration required' : 'No migration needed'
    });
  } catch (error) {
    console.error('❌ Migration check error:', error);
    return NextResponse.json({
      needsMigration: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
