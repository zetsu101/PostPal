-- AI Insights Feedback Table
-- Stores user feedback on AI insights to improve the system

CREATE TABLE IF NOT EXISTS ai_insights_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_id TEXT,
  feature TEXT NOT NULL CHECK (feature IN ('content_analysis', 'engagement_prediction', 'optimal_timing', 'trend_prediction', 'audience_insights', 'recommendations')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  helpful BOOLEAN NOT NULL,
  feedback_text TEXT,
  context JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON ai_insights_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_feature ON ai_insights_feedback(feature);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON ai_insights_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON ai_insights_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_helpful ON ai_insights_feedback(helpful);

-- Enable Row Level Security
ALTER TABLE ai_insights_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own feedback
CREATE POLICY "Users can view their own feedback"
  ON ai_insights_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON ai_insights_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_feedback_timestamp
  BEFORE UPDATE ON ai_insights_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- View for feedback analytics
CREATE OR REPLACE VIEW ai_insights_feedback_stats AS
SELECT
  feature,
  COUNT(*) as total_feedback,
  AVG(rating) as average_rating,
  COUNT(*) FILTER (WHERE helpful = true) as helpful_count,
  COUNT(*) FILTER (WHERE helpful = false) as not_helpful_count,
  ROUND(
    COUNT(*) FILTER (WHERE helpful = true)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as helpful_percentage
FROM ai_insights_feedback
GROUP BY feature;

-- View for recent feedback with user info
CREATE OR REPLACE VIEW recent_ai_feedback AS
SELECT
  f.id,
  f.feature,
  f.rating,
  f.helpful,
  f.feedback_text,
  f.context,
  f.created_at,
  u.email as user_email
FROM ai_insights_feedback f
JOIN auth.users u ON f.user_id = u.id
ORDER BY f.created_at DESC
LIMIT 100;

