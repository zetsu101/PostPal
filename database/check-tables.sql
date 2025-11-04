-- Quick Migration Check Query
-- Run this in Supabase SQL Editor to check if tables exist

SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'users', 'posts', 'analytics', 'organizations', 
            'team_members', 'ai_optimizations', 'ai_insights_feedback',
            'social_media_configs', 'content_templates', 'ai_generations',
            'performance_metrics', 'departments'
        ) THEN '✅ Expected'
        ELSE '⚠️  Extra'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name IN (
            'users', 'posts', 'analytics', 'organizations', 
            'team_members', 'ai_optimizations', 'ai_insights_feedback',
            'social_media_configs', 'content_templates', 'ai_generations',
            'performance_metrics', 'departments'
        ) THEN 0
        ELSE 1
    END,
    table_name;

-- Expected Results:
-- If you see 7+ tables with "✅ Expected" → Migrations already run!
-- If you see 0-2 tables → Need to run migrations

