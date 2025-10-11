import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for AI analytics
export interface ContentAnalysis {
  engagementScore: number; // 0-100
  viralityPotential: number; // 0-100
  optimalTiming: string;
  suggestedHashtags: string[];
  improvements: string[];
  platformOptimizations: Record<string, string>;
}

export interface TrendAnalysis {
  trendingTopics: Array<{
    topic: string;
    popularity: number;
    growthRate: number;
    platform: string;
  }>;
  optimalHashtags: Array<{
    hashtag: string;
    engagement: number;
    competition: number;
    reach: number;
  }>;
  bestPostingTimes: Array<{
    platform: string;
    timeSlots: Array<{
      hour: number;
      day: string;
      engagement: number;
    }>;
  }>;
}

export interface PerformancePrediction {
  estimatedReach: number;
  estimatedEngagement: number;
  estimatedLikes: number;
  estimatedComments: number;
  estimatedShares: number;
  confidence: number; // 0-100
  factors: string[];
}

export interface ContentOptimization {
  originalContent: string;
  optimizedContent: string;
  changes: Array<{
    type: 'add' | 'remove' | 'modify';
    description: string;
    impact: 'low' | 'medium' | 'high';
  }>;
  improvementScore: number; // 0-100
}

export class AIAnalyticsService {
  async analyzeContent(
    content: string,
    platform: string,
    targetAudience?: string
  ): Promise<ContentAnalysis> {
    try {
      const prompt = `
        Analyze this social media content for ${platform}:
        Content: "${content}"
        Target Audience: ${targetAudience || 'General audience'}
        
        Provide analysis in JSON format with:
        - engagementScore: number (0-100)
        - viralityPotential: number (0-100)
        - optimalTiming: string (best time to post)
        - suggestedHashtags: array of 5-10 relevant hashtags
        - improvements: array of 3-5 specific suggestions
        - platformOptimizations: object with platform-specific tips
        
        Focus on engagement, clarity, emotional impact, and platform best practices.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        engagementScore: analysis.engagementScore || 0,
        viralityPotential: analysis.viralityPotential || 0,
        optimalTiming: analysis.optimalTiming || '9:00 AM',
        suggestedHashtags: analysis.suggestedHashtags || [],
        improvements: analysis.improvements || [],
        platformOptimizations: analysis.platformOptimizations || {},
      };
    } catch (error) {
      console.error('Error analyzing content:', error);
      return this.getFallbackAnalysis();
    }
  }

  async predictPerformance(
    content: string,
    platform: string,
    userHistory?: any
  ): Promise<PerformancePrediction> {
    try {
      const prompt = `
        Predict the performance of this social media post:
        Content: "${content}"
        Platform: ${platform}
        User History: ${userHistory ? JSON.stringify(userHistory) : 'No history available'}
        
        Provide prediction in JSON format with:
        - estimatedReach: number (expected reach)
        - estimatedEngagement: number (total engagement)
        - estimatedLikes: number
        - estimatedComments: number
        - estimatedShares: number
        - confidence: number (0-100, prediction confidence)
        - factors: array of key factors influencing prediction
        
        Base predictions on content quality, platform algorithms, timing, and user history.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });

      const prediction = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        estimatedReach: prediction.estimatedReach || 0,
        estimatedEngagement: prediction.estimatedEngagement || 0,
        estimatedLikes: prediction.estimatedLikes || 0,
        estimatedComments: prediction.estimatedComments || 0,
        estimatedShares: prediction.estimatedShares || 0,
        confidence: prediction.confidence || 0,
        factors: prediction.factors || [],
      };
    } catch (error) {
      console.error('Error predicting performance:', error);
      return this.getFallbackPrediction();
    }
  }

  async optimizeContent(
    content: string,
    platform: string,
    goal: 'engagement' | 'reach' | 'conversions' = 'engagement'
  ): Promise<ContentOptimization> {
    try {
      const prompt = `
        Optimize this social media content for ${goal} on ${platform}:
        Original Content: "${content}"
        
        Provide optimization in JSON format with:
        - optimizedContent: string (improved version)
        - changes: array of objects with type, description, and impact
        - improvementScore: number (0-100, improvement percentage)
        
        Focus on:
        - Better engagement hooks
        - Platform-specific formatting
        - Call-to-action optimization
        - Emotional impact
        - Clarity and conciseness
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const optimization = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        originalContent: content,
        optimizedContent: optimization.optimizedContent || content,
        changes: optimization.changes || [],
        improvementScore: optimization.improvementScore || 0,
      };
    } catch (error) {
      console.error('Error optimizing content:', error);
      return {
        originalContent: content,
        optimizedContent: content,
        changes: [],
        improvementScore: 0,
      };
    }
  }

  async analyzeTrends(platforms: string[] = ['instagram', 'linkedin', 'facebook', 'twitter']): Promise<TrendAnalysis> {
    try {
      const prompt = `
        Analyze current social media trends for: ${platforms.join(', ')}
        
        Provide analysis in JSON format with:
        - trendingTopics: array of objects with topic, popularity (0-100), growthRate (%), platform
        - optimalHashtags: array of objects with hashtag, engagement (0-100), competition (0-100), reach (0-100)
        - bestPostingTimes: array of objects with platform, timeSlots (hour, day, engagement)
        
        Focus on current trends, emerging topics, and optimal posting strategies.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      });

      const trends = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        trendingTopics: trends.trendingTopics || [],
        optimalHashtags: trends.optimalHashtags || [],
        bestPostingTimes: trends.bestPostingTimes || [],
      };
    } catch (error) {
      console.error('Error analyzing trends:', error);
      return this.getFallbackTrends();
    }
  }

  async generateHashtagSuggestions(
    content: string,
    platform: string,
    targetAudience?: string
  ): Promise<string[]> {
    try {
      const prompt = `
        Generate 10 highly relevant and trending hashtags for this content on ${platform}:
        Content: "${content}"
        Target Audience: ${targetAudience || 'General audience'}
        
        Return as a JSON array of hashtag strings.
        Mix popular and niche hashtags for optimal reach.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      const hashtags = JSON.parse(response.choices[0].message.content || '[]');
      return Array.isArray(hashtags) ? hashtags : [];
    } catch (error) {
      console.error('Error generating hashtags:', error);
      return this.getFallbackHashtags(content);
    }
  }

  async suggestOptimalPostingTime(
    platform: string,
    userHistory?: any,
    targetAudience?: string
  ): Promise<string[]> {
    try {
      const prompt = `
        Suggest optimal posting times for ${platform}:
        User History: ${userHistory ? JSON.stringify(userHistory) : 'No history available'}
        Target Audience: ${targetAudience || 'General audience'}
        
        Return as a JSON array of time strings (e.g., ["9:00 AM", "2:00 PM", "7:00 PM"]).
        Consider platform algorithms, audience behavior, and user's historical performance.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });

      const times = JSON.parse(response.choices[0].message.content || '[]');
      return Array.isArray(times) ? times : ['9:00 AM', '2:00 PM', '7:00 PM'];
    } catch (error) {
      console.error('Error suggesting posting times:', error);
      return ['9:00 AM', '2:00 PM', '7:00 PM'];
    }
  }

  // Fallback methods for when AI fails
  private getFallbackAnalysis(): ContentAnalysis {
    return {
      engagementScore: 65,
      viralityPotential: 45,
      optimalTiming: '9:00 AM',
      suggestedHashtags: ['#content', '#socialmedia', '#marketing', '#engagement', '#viral'],
      improvements: [
        'Add a clear call-to-action',
        'Include relevant hashtags',
        'Optimize for mobile viewing',
      ],
      platformOptimizations: {
        general: 'Focus on visual appeal and clear messaging',
      },
    };
  }

  private getFallbackPrediction(): PerformancePrediction {
    return {
      estimatedReach: 500,
      estimatedEngagement: 50,
      estimatedLikes: 40,
      estimatedComments: 8,
      estimatedShares: 2,
      confidence: 60,
      factors: ['Content quality', 'Timing', 'Audience engagement'],
    };
  }

  private getFallbackTrends(): TrendAnalysis {
    return {
      trendingTopics: [
        { topic: 'AI Technology', popularity: 85, growthRate: 15, platform: 'all' },
        { topic: 'Sustainability', popularity: 75, growthRate: 8, platform: 'all' },
      ],
      optimalHashtags: [
        { hashtag: '#AI', engagement: 80, competition: 70, reach: 85 },
        { hashtag: '#Tech', engagement: 75, competition: 65, reach: 90 },
      ],
      bestPostingTimes: [
        {
          platform: 'instagram',
          timeSlots: [
            { hour: 9, day: 'weekday', engagement: 85 },
            { hour: 19, day: 'weekday', engagement: 80 },
          ],
        },
      ],
    };
  }

  private getFallbackHashtags(content: string): string[] {
    const baseHashtags = ['#content', '#socialmedia', '#marketing'];
    const contentWords = content.toLowerCase().split(' ').slice(0, 3);
    const hashtags = contentWords.map(word => `#${word.replace(/[^a-z]/g, '')}`);
    return [...baseHashtags, ...hashtags].slice(0, 10);
  }
}

export const aiAnalyticsService = new AIAnalyticsService();
