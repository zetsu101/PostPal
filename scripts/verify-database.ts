#!/usr/bin/env ts-node
/**
 * Database Verification Script
 * Verifies that all required tables exist in the Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');
const { join } = require('path');

// Simple env loader (no external dependency)
function loadEnv() {
  try {
    const envPath = join(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line: string) => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match && !match[1].startsWith('#')) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (err) {
    // .env.local might not exist, that's okay
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Required tables from base schema
const BASE_TABLES = [
  'users',
  'posts',
  'analytics',
  'social_media_configs',
  'content_templates',
  'ai_generations',
];

// Extended tables (from schema-extended.sql)
const EXTENDED_TABLES = [
  'organizations',
  'team_members',
  'departments',
  'ai_optimizations',
  'performance_metrics',
  'scheduled_posts',
  'cross_platform_posts',
];

// All required tables
const ALL_TABLES = [...BASE_TABLES, ...EXTENDED_TABLES];

interface TableStatus {
  name: string;
  exists: boolean;
  rowCount?: number;
  error?: string;
}

async function checkTableExists(tableName: string): Promise<TableStatus> {
  try {
    // Try to query the table (limit 1 for performance)
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      // If error code is 42P01, table doesn't exist
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return {
          name: tableName,
          exists: false,
          error: 'Table does not exist',
        };
      }
      return {
        name: tableName,
        exists: false,
        error: error.message,
      };
    }

    return {
      name: tableName,
      exists: true,
      rowCount: count || 0,
    };
  } catch (err: any) {
    return {
      name: tableName,
      exists: false,
      error: err.message || 'Unknown error',
    };
  }
}

async function verifyDatabase() {
  console.log('🔍 Verifying PostPal Database Schema...\n');
  console.log(`📊 Supabase URL: ${supabaseUrl}\n`);

  const results: TableStatus[] = [];

  // Check base tables
  console.log('📋 Checking Base Schema Tables...');
  for (const table of BASE_TABLES) {
    const status = await checkTableExists(table);
    results.push(status);
    const icon = status.exists ? '✅' : '❌';
    const count = status.exists ? ` (${status.rowCount} rows)` : '';
    const error = status.error ? ` - ${status.error}` : '';
    console.log(`  ${icon} ${table}${count}${error}`);
  }

  console.log('\n📋 Checking Extended Schema Tables...');
  for (const table of EXTENDED_TABLES) {
    const status = await checkTableExists(table);
    results.push(status);
    const icon = status.exists ? '✅' : '❌';
    const count = status.exists ? ` (${status.rowCount} rows)` : '';
    const error = status.error ? ` - ${status.error}` : '';
    console.log(`  ${icon} ${table}${count}${error}`);
  }

  // Summary
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);

  console.log('\n' + '='.repeat(50));
  console.log('📊 Verification Summary');
  console.log('='.repeat(50));
  console.log(`✅ Tables Found: ${existing.length}/${ALL_TABLES.length}`);
  console.log(`❌ Tables Missing: ${missing.length}/${ALL_TABLES.length}`);

  if (missing.length > 0) {
    console.log('\n⚠️  Missing Tables:');
    missing.forEach(table => {
      console.log(`   - ${table.name}`);
    });
    console.log('\n💡 To fix:');
    console.log('   1. Run database/schema.sql in Supabase SQL Editor');
    if (missing.some(t => EXTENDED_TABLES.includes(t.name))) {
      console.log('   2. Run database/schema-extended.sql in Supabase SQL Editor');
    }
    console.log('   3. Re-run this verification script');
    process.exit(1);
  } else {
    console.log('\n✅ All tables verified! Database schema is complete.');
    process.exit(0);
  }
}

// Run verification
verifyDatabase().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

