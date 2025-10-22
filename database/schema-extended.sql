-- PostPal Extended Database Schema
-- Run this in the Supabase SQL editor after the base schema

-- ==============================================
-- TEAM COLLABORATION TABLES
-- ==============================================

-- Organizations/Workspaces table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_plan VARCHAR(20) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table (extends users for team functionality)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'invited')),
  department_id UUID,
  permissions JSONB DEFAULT '{}'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update team_members to reference departments
ALTER TABLE team_members 
ADD CONSTRAINT fk_team_members_department 
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Team activity log
CREATE TABLE IF NOT EXISTS team_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50), -- 'post', 'user', 'department', etc.
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  invited_by UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- AI OPTIMIZATION TABLES
-- ==============================================

-- AI content optimization history
CREATE TABLE IF NOT EXISTS ai_optimizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  original_content TEXT NOT NULL,
  optimized_content TEXT NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'facebook', 'twitter', 'tiktok')),
  optimization_score INTEGER DEFAULT 0 CHECK (optimization_score >= 0 AND optimization_score <= 100),
  improvements_applied JSONB DEFAULT '[]'::jsonb,
  predicted_metrics JSONB DEFAULT '{}'::jsonb,
  actual_metrics JSONB DEFAULT '{}'::jsonb,
  model_used VARCHAR(100) DEFAULT 'gpt-4',
  processing_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI optimization suggestions
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  optimization_id UUID REFERENCES ai_optimizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'hashtag', 'timing', 'format', 'tone', 'length'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 100),
  effort_level VARCHAR(20) DEFAULT 'easy' CHECK (effort_level IN ('easy', 'medium', 'hard')),
  category VARCHAR(50) NOT NULL,
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content performance predictions
CREATE TABLE IF NOT EXISTS content_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  optimization_id UUID REFERENCES ai_optimizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  predicted_likes INTEGER DEFAULT 0,
  predicted_comments INTEGER DEFAULT 0,
  predicted_shares INTEGER DEFAULT 0,
  predicted_reach INTEGER DEFAULT 0,
  predicted_engagement_rate DECIMAL(5,2) DEFAULT 0.00,
  confidence_score DECIMAL(5,2) DEFAULT 0.00 CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
  model_version VARCHAR(50) DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- PERFORMANCE MONITORING TABLES
-- ==============================================

-- Performance metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  metric_unit VARCHAR(20) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'speed', 'size', 'efficiency', 'user-experience'
  platform VARCHAR(50), -- 'web', 'mobile', 'api'
  device_info JSONB DEFAULT '{}'::jsonb,
  browser_info JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle analysis results
CREATE TABLE IF NOT EXISTS bundle_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  total_size_bytes BIGINT NOT NULL,
  js_size_bytes BIGINT NOT NULL,
  css_size_bytes BIGINT NOT NULL,
  image_size_bytes BIGINT NOT NULL,
  unused_code_bytes BIGINT DEFAULT 0,
  duplicates_bytes BIGINT DEFAULT 0,
  recommendations JSONB DEFAULT '[]'::jsonb,
  analysis_version VARCHAR(50) DEFAULT 'v1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance optimization suggestions
CREATE TABLE IF NOT EXISTS performance_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'bundle', 'images', 'caching', 'network', 'rendering'
  impact_level VARCHAR(20) DEFAULT 'medium' CHECK (impact_level IN ('low', 'medium', 'high')),
  effort_level VARCHAR(20) DEFAULT 'medium' CHECK (effort_level IN ('easy', 'medium', 'hard')),
  estimated_improvement VARCHAR(255),
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Team collaboration indexes
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_organization_id ON team_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_organization_id ON team_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_team_member_id ON team_activities(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_activities_created_at ON team_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_team_invitations_organization_id ON team_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);

-- AI optimization indexes
CREATE INDEX IF NOT EXISTS idx_ai_optimizations_user_id ON ai_optimizations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_optimizations_organization_id ON ai_optimizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_optimizations_platform ON ai_optimizations(platform);
CREATE INDEX IF NOT EXISTS idx_ai_optimizations_score ON ai_optimizations(optimization_score);
CREATE INDEX IF NOT EXISTS idx_ai_optimizations_created_at ON ai_optimizations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_optimization_id ON ai_suggestions(optimization_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_applied ON ai_suggestions(applied);
CREATE INDEX IF NOT EXISTS idx_content_predictions_optimization_id ON content_predictions(optimization_id);
CREATE INDEX IF NOT EXISTS idx_content_predictions_user_id ON content_predictions(user_id);

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_organization_id ON performance_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_category ON performance_metrics(category);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_bundle_analyses_user_id ON bundle_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_bundle_analyses_organization_id ON bundle_analyses(organization_id);
CREATE INDEX IF NOT EXISTS idx_bundle_analyses_created_at ON bundle_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_suggestions_user_id ON performance_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_suggestions_organization_id ON performance_suggestions(organization_id);
CREATE INDEX IF NOT EXISTS idx_performance_suggestions_applied ON performance_suggestions(applied);

-- ==============================================
-- TRIGGERS FOR UPDATED_AT
-- ==============================================

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_invitations_updated_at BEFORE UPDATE ON team_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_optimizations_updated_at BEFORE UPDATE ON ai_optimizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on new tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_suggestions ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view organizations they own or are members of" ON organizations
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.organization_id = organizations.id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update organizations they own" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can insert organizations" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Team members policies
CREATE POLICY "Users can view team members in their organizations" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = team_members.organization_id 
      AND (organizations.owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM team_members tm 
             WHERE tm.organization_id = organizations.id 
             AND tm.user_id = auth.uid()
           ))
    )
  );

CREATE POLICY "Organization owners and admins can manage team members" ON team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = team_members.organization_id 
      AND (organizations.owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM team_members tm 
             WHERE tm.organization_id = organizations.id 
             AND tm.user_id = auth.uid() 
             AND tm.role IN ('owner', 'admin')
           ))
    )
  );

-- Departments policies
CREATE POLICY "Users can view departments in their organizations" ON departments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = departments.organization_id 
      AND (organizations.owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM team_members 
             WHERE team_members.organization_id = organizations.id 
             AND team_members.user_id = auth.uid()
           ))
    )
  );

CREATE POLICY "Organization owners and admins can manage departments" ON departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = departments.organization_id 
      AND (organizations.owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM team_members tm 
             WHERE tm.organization_id = organizations.id 
             AND tm.user_id = auth.uid() 
             AND tm.role IN ('owner', 'admin')
           ))
    )
  );

-- Team activities policies
CREATE POLICY "Users can view activities in their organizations" ON team_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = team_activities.organization_id 
      AND (organizations.owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM team_members 
             WHERE team_members.organization_id = organizations.id 
             AND team_members.user_id = auth.uid()
           ))
    )
  );

CREATE POLICY "System can insert team activities" ON team_activities
  FOR INSERT WITH CHECK (true);

-- Team invitations policies
CREATE POLICY "Users can view invitations for their organizations" ON team_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = team_invitations.organization_id 
      AND (organizations.owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM team_members tm 
             WHERE tm.organization_id = organizations.id 
             AND tm.user_id = auth.uid() 
             AND tm.role IN ('owner', 'admin')
           ))
    )
  );

CREATE POLICY "Organization owners and admins can manage invitations" ON team_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = team_invitations.organization_id 
      AND (organizations.owner_id = auth.uid() OR 
           EXISTS (
             SELECT 1 FROM team_members tm 
             WHERE tm.organization_id = organizations.id 
             AND tm.user_id = auth.uid() 
             AND tm.role IN ('owner', 'admin')
           ))
    )
  );

-- AI optimizations policies
CREATE POLICY "Users can view their own AI optimizations" ON ai_optimizations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own AI optimizations" ON ai_optimizations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own AI optimizations" ON ai_optimizations
  FOR UPDATE USING (user_id = auth.uid());

-- AI suggestions policies
CREATE POLICY "Users can view their own AI suggestions" ON ai_suggestions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own AI suggestions" ON ai_suggestions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own AI suggestions" ON ai_suggestions
  FOR UPDATE USING (user_id = auth.uid());

-- Content predictions policies
CREATE POLICY "Users can view their own content predictions" ON content_predictions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own content predictions" ON content_predictions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Performance metrics policies
CREATE POLICY "Users can view their own performance metrics" ON performance_metrics
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert performance metrics" ON performance_metrics
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Bundle analyses policies
CREATE POLICY "Users can view their own bundle analyses" ON bundle_analyses
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert bundle analyses" ON bundle_analyses
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Performance suggestions policies
CREATE POLICY "Users can view their own performance suggestions" ON performance_suggestions
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert performance suggestions" ON performance_suggestions
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own performance suggestions" ON performance_suggestions
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

-- ==============================================
-- SAMPLE DATA FOR TESTING
-- ==============================================

-- Create a sample organization
INSERT INTO organizations (id, name, description, owner_id, subscription_plan) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Demo Marketing Team', 'Sample organization for testing team features', '00000000-0000-0000-0000-000000000001', 'pro')
ON CONFLICT (id) DO NOTHING;

-- Create a sample department
INSERT INTO departments (id, organization_id, name, description, color) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Marketing', 'Social media marketing and brand management', '#3B82F6')
ON CONFLICT (id) DO NOTHING;

-- Add demo user as team member
INSERT INTO team_members (id, organization_id, user_id, role, status, department_id) VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'owner', 'active', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Sample AI optimization
INSERT INTO ai_optimizations (id, user_id, organization_id, original_content, optimized_content, platform, optimization_score, improvements_applied, predicted_metrics) VALUES
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Check out our new product!', '🚀 Excited to announce our latest innovation! Check out what we\'ve been working on. #innovation #product #tech', 'instagram', 87, '["emojis", "hashtags", "engagement"]', '{"likes": 245, "comments": 18, "shares": 32, "reach": 1250, "engagement_rate": 8.7}')
ON CONFLICT (id) DO NOTHING;
