import { createClient } from '@/lib/supabase';

export interface ContentOptimization {
  id: string;
  originalContent: string;
  optimizedContent: string;
  platform: string;
  optimizationScore: number;
  improvementsApplied: string[];
  predictedMetrics: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    engagementRate: number;
  };
  actualMetrics?: {
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    engagementRate: number;
  };
  suggestions: OptimizationSuggestion[];
  createdAt: string;
  updatedAt: string;
}

export interface OptimizationSuggestion {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: number;
  effort: string;
  category: string;
  applied: boolean;
  appliedAt?: string;
}

export interface ContentPrediction {
  id: string;
  predictedLikes: number;
  predictedComments: number;
  predictedShares: number;
  predictedReach: number;
  predictedEngagementRate: number;
  confidenceScore: number;
  modelVersion: string;
  createdAt: string;
}

class AIOptimizationService {
  private supabase = createClient();

  async optimizeContent(
    content: string,
    platform: string,
    organizationId?: string
  ): Promise<ContentOptimization> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          platform,
          organizationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize content');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error optimizing content:', error);
      throw error;
    }
  }

  async getOptimizationHistory(
    organizationId?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<ContentOptimization[]> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (organizationId) {
        params.append('organizationId', organizationId);
      }

      const response = await fetch(`/api/ai/optimize?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch optimization history: ${response.statusText}`);
      }

      const data = await response.json();
      return data.optimizations || [];
    } catch (error) {
      console.error('Error fetching optimization history:', error);
      throw error;
    }
  }

  async getOptimizationById(optimizationId: string): Promise<ContentOptimization | null> {
    try {
      const { data, error } = await this.supabase
        .from('ai_optimizations')
        .select(`
          *,
          ai_suggestions(*),
          content_predictions(*)
        `)
        .eq('id', optimizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return {
        id: data.id,
        originalContent: data.original_content,
        optimizedContent: data.optimized_content,
        platform: data.platform,
        optimizationScore: data.optimization_score,
        improvementsApplied: data.improvements_applied || [],
        predictedMetrics: data.predicted_metrics || {},
        actualMetrics: data.actual_metrics || undefined,
        suggestions: data.ai_suggestions?.map((suggestion: any) => ({
          id: suggestion.id,
          type: suggestion.type,
          title: suggestion.title,
          description: suggestion.description,
          impact: suggestion.impact_score,
          effort: suggestion.effort_level,
          category: suggestion.category,
          applied: suggestion.applied,
          appliedAt: suggestion.applied_at,
        })) || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching optimization by ID:', error);
      throw error;
    }
  }

  async applySuggestion(suggestionId: string): Promise<OptimizationSuggestion> {
    try {
      const { data, error } = await this.supabase
        .from('ai_suggestions')
        .update({
          applied: true,
          applied_at: new Date().toISOString(),
        })
        .eq('id', suggestionId)
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        type: data.type,
        title: data.title,
        description: data.description,
        impact: data.impact_score,
        effort: data.effort_level,
        category: data.category,
        applied: data.applied,
        appliedAt: data.applied_at,
      };
    } catch (error) {
      console.error('Error applying suggestion:', error);
      throw error;
    }
  }

  async removeSuggestion(suggestionId: string): Promise<OptimizationSuggestion> {
    try {
      const { data, error } = await this.supabase
        .from('ai_suggestions')
        .update({
          applied: false,
          applied_at: null,
        })
        .eq('id', suggestionId)
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        type: data.type,
        title: data.title,
        description: data.description,
        impact: data.impact_score,
        effort: data.effort_level,
        category: data.category,
        applied: data.applied,
        appliedAt: data.applied_at,
      };
    } catch (error) {
      console.error('Error removing suggestion:', error);
      throw error;
    }
  }

  async updateActualMetrics(
    optimizationId: string,
    actualMetrics: {
      likes: number;
      comments: number;
      shares: number;
      reach: number;
      engagementRate: number;
    }
  ): Promise<ContentOptimization> {
    try {
      const { data, error } = await this.supabase
        .from('ai_optimizations')
        .update({
          actual_metrics: actualMetrics,
        })
        .eq('id', optimizationId)
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        originalContent: data.original_content,
        optimizedContent: data.optimized_content,
        platform: data.platform,
        optimizationScore: data.optimization_score,
        improvementsApplied: data.improvements_applied || [],
        predictedMetrics: data.predicted_metrics || {},
        actualMetrics: data.actual_metrics || undefined,
        suggestions: [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error updating actual metrics:', error);
      throw error;
    }
  }

  async getOptimizationStats(organizationId?: string): Promise<{
    totalOptimizations: number;
    averageScore: number;
    platformsBreakdown: Record<string, number>;
    appliedSuggestions: number;
    totalSuggestions: number;
  }> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      let query = this.supabase
        .from('ai_optimizations')
        .select('platform, optimization_score, ai_suggestions(applied)')
        .eq('user_id', session.user.id);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalOptimizations = data.length;
      const averageScore = totalOptimizations > 0 
        ? Math.round(data.reduce((sum, opt) => sum + opt.optimization_score, 0) / totalOptimizations)
        : 0;

      const platformsBreakdown = data.reduce((acc, opt) => {
        acc[opt.platform] = (acc[opt.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const allSuggestions = data.flatMap(opt => opt.ai_suggestions || []);
      const appliedSuggestions = allSuggestions.filter(s => s.applied).length;
      const totalSuggestions = allSuggestions.length;

      return {
        totalOptimizations,
        averageScore,
        platformsBreakdown,
        appliedSuggestions,
        totalSuggestions,
      };
    } catch (error) {
      console.error('Error fetching optimization stats:', error);
      throw error;
    }
  }

  async getTrendingSuggestions(organizationId?: string, limit: number = 10): Promise<OptimizationSuggestion[]> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      let query = this.supabase
        .from('ai_suggestions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('applied', true)
        .order('applied_at', { ascending: false })
        .limit(limit);

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(suggestion => ({
        id: suggestion.id,
        type: suggestion.type,
        title: suggestion.title,
        description: suggestion.description,
        impact: suggestion.impact_score,
        effort: suggestion.effort_level,
        category: suggestion.category,
        applied: suggestion.applied,
        appliedAt: suggestion.applied_at,
      }));
    } catch (error) {
      console.error('Error fetching trending suggestions:', error);
      throw error;
    }
  }

  async deleteOptimization(optimizationId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ai_optimizations')
        .delete()
        .eq('id', optimizationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting optimization:', error);
      throw error;
    }
  }
}

export const aiOptimizationService = new AIOptimizationService();
