// AI Service for Content Generation and Optimization
export interface AIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface ContentPrompt {
  topic: string;
  platform: 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'tiktok';
  contentType: 'post' | 'story' | 'reel' | 'article' | 'video';
  tone: 'professional' | 'casual' | 'friendly' | 'humorous' | 'inspirational';
  targetAudience: string;
  hashtagCount: number;
  language: string;
  includeEmojis: boolean;
  callToAction?: string;
}

export interface GeneratedContent {
  id: string;
  type: 'caption' | 'hashtags' | 'image-prompt' | 'complete-post' | 'video-script' | 'carousel-content';
  content: string;
  prompt: ContentPrompt;
  metadata: {
    wordCount: number;
    hashtagCount: number;
    emojiCount: number;
    estimatedReadTime: number;
    generatedAt: Date;
  };
}

export interface ImageGenerationPrompt {
  prompt: string;
  style: string;
  platform: string;
  targetAudience: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  metadata: {
    platform: string;
    style: string;
    generatedAt: Date;
  };
}

export interface ContentOptimization {
  platform: string;
  suggestions: {
    bestPostingTime: string;
    optimalLength: string;
    hashtagStrategy: string;
    engagementTips: string[];
    trendingTopics: string[];
    competitorInsights: string[];
  };
  generatedAt: Date;
}

// AI Content Generation Service
export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  private async callAIApi(type: string, prompt: ContentPrompt, options: { maxTokens?: number; temperature?: number } = {}): Promise<string> {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          prompt,
          maxTokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      return data.content;
    } catch (error) {
      console.error('AI API call failed:', error);
      throw new Error('Failed to generate content. Please try again.');
    }
  }

  // Generate social media caption
  async generateCaption(prompt: ContentPrompt): Promise<GeneratedContent> {
    try {
      const content = await this.callAIApi('caption', prompt);
      return this.parseGeneratedContent(content, prompt, 'caption');
    } catch (error) {
      console.error('Caption generation failed:', error);
      throw new Error('Failed to generate caption. Please try again.');
    }
  }

  // Generate hashtags
  async generateHashtags(prompt: ContentPrompt): Promise<GeneratedContent> {
    try {
      const content = await this.callAIApi('hashtags', prompt, { maxTokens: 200, temperature: 0.7 });
      return this.parseGeneratedContent(content, prompt, 'hashtags');
    } catch (error) {
      console.error('Hashtag generation failed:', error);
      throw new Error('Failed to generate hashtags. Please try again.');
    }
  }

  // Generate image prompt
  async generateImagePrompt(prompt: ContentPrompt): Promise<GeneratedContent> {
    try {
      const content = await this.callAIApi('image-prompt', prompt, { maxTokens: 300, temperature: 0.8 });
      return this.parseGeneratedContent(content, prompt, 'image-prompt');
    } catch (error) {
      console.error('Image prompt generation failed:', error);
      throw new Error('Failed to generate image prompt. Please try again.');
    }
  }

  // Generate complete post
  async generateCompletePost(prompt: ContentPrompt): Promise<GeneratedContent> {
    try {
      const content = await this.callAIApi('complete-post', prompt);
      return this.parseGeneratedContent(content, prompt, 'complete-post');
    } catch (error) {
      console.error('Complete post generation failed:', error);
      throw new Error('Failed to generate complete post. Please try again.');
    }
  }

  // Generate video script
  async generateVideoScript(prompt: ContentPrompt): Promise<GeneratedContent> {
    try {
      const content = await this.callAIApi('video-script', prompt, { maxTokens: 500, temperature: 0.8 });
      return this.parseGeneratedContent(content, prompt, 'video-script');
    } catch (error) {
      console.error('Video script generation failed:', error);
      throw new Error('Failed to generate video script. Please try again.');
    }
  }

  // Generate carousel content
  async generateCarouselContent(prompt: ContentPrompt): Promise<GeneratedContent> {
    try {
      const content = await this.callAIApi('carousel-content', prompt, { maxTokens: 800, temperature: 0.8 });
      return this.parseGeneratedContent(content, prompt, 'carousel-content');
    } catch (error) {
      console.error('Carousel content generation failed:', error);
      throw new Error('Failed to generate carousel content. Please try again.');
    }
  }

  // Content optimization suggestions
  async getContentOptimization(prompt: ContentPrompt): Promise<ContentOptimization> {
    try {
      const content = await this.callAIApi('optimization', prompt, { maxTokens: 600, temperature: 0.7 });
      return this.parseOptimizationContent(content, prompt.platform);
    } catch (error) {
      console.error('Content optimization failed:', error);
      throw new Error('Failed to get optimization suggestions. Please try again.');
    }
  }

  // Helper methods
  private parseGeneratedContent(content: string, prompt: ContentPrompt, type: GeneratedContent['type']): GeneratedContent {
    const wordCount = content.split(/\s+/).length;
    const hashtagCount = (content.match(/#\w+/g) || []).length;
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    const estimatedReadTime = Math.ceil(wordCount / 200); // Average reading speed

    return {
      id: crypto.randomUUID(),
      type,
      content,
      prompt,
      metadata: {
        wordCount,
        hashtagCount,
        emojiCount,
        estimatedReadTime,
        generatedAt: new Date(),
      },
    };
  }

  private parseOptimizationContent(content: string, platform: string): ContentOptimization {
    // Simple parsing - in a real app, you'd want more sophisticated parsing
    const lines = content.split('\n').filter(line => line.trim());
    
    return {
      platform,
      suggestions: {
        bestPostingTime: lines.find(line => line.includes('posting time') || line.includes('best time')) || 'Based on your audience',
        optimalLength: lines.find(line => line.includes('length') || line.includes('optimal')) || 'Platform-appropriate',
        hashtagStrategy: lines.find(line => line.includes('hashtag') || line.includes('tag')) || 'Mix of trending and niche',
        engagementTips: lines.filter(line => line.includes('tip') || line.includes('engage') || line.includes('interact')),
        trendingTopics: lines.filter(line => line.includes('trend') || line.includes('viral') || line.includes('popular')),
        competitorInsights: lines.filter(line => line.includes('competitor') || line.includes('competition') || line.includes('industry')),
      },
      generatedAt: new Date(),
    };
  }
}

// Mock AI Service for Development
export class MockAIService {
  static async generateCaption(prompt: ContentPrompt): Promise<GeneratedContent> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockContent = `🎯 Exciting news about ${prompt.topic}! 

This ${prompt.contentType} is perfect for ${prompt.platform} and will definitely resonate with ${prompt.targetAudience}. 

The ${prompt.tone} tone makes it approachable and engaging. ${prompt.includeEmojis ? '✨💫' : ''}

${prompt.callToAction || 'What do you think? Drop a comment below!'} 👇`;

    return {
      id: crypto.randomUUID(),
      type: 'caption',
      content: mockContent,
      prompt,
      metadata: {
        wordCount: mockContent.split(/\s+/).length,
        hashtagCount: 0,
        emojiCount: (mockContent.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length,
        estimatedReadTime: 1,
        generatedAt: new Date(),
      },
    };
  }

  static async generateHashtags(prompt: ContentPrompt): Promise<GeneratedContent> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockHashtags = `#${prompt.topic.replace(/\s+/g, '')} #${prompt.platform} #${prompt.contentType} #${prompt.tone} #${prompt.targetAudience.replace(/\s+/g, '')} #trending #viral #engagement #socialmedia #contentcreation`;
    
    return {
      id: crypto.randomUUID(),
      type: 'hashtags',
      content: mockHashtags,
      prompt,
      metadata: {
        wordCount: mockHashtags.split(/\s+/).length,
        hashtagCount: (mockHashtags.match(/#\w+/g) || []).length,
        emojiCount: 0,
        estimatedReadTime: 1,
        generatedAt: new Date(),
      },
    };
  }

  static async generateImagePrompt(prompt: ContentPrompt): Promise<GeneratedContent> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockPrompt = `A ${prompt.tone} and engaging ${prompt.contentType} visual about "${prompt.topic}" for ${prompt.platform}. The image should feature vibrant colors, modern composition, and appeal to ${prompt.targetAudience}. Include elements that represent the topic clearly and make it instantly recognizable and shareable.`;
    
    return {
      id: crypto.randomUUID(),
      type: 'image-prompt',
      content: mockPrompt,
      prompt,
      metadata: {
        wordCount: mockPrompt.split(/\s+/).length,
        hashtagCount: 0,
        emojiCount: 0,
        estimatedReadTime: 1,
        generatedAt: new Date(),
      },
    };
  }

  static async generateCompletePost(prompt: ContentPrompt): Promise<GeneratedContent> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockPost = `📱 Complete ${prompt.contentType} for ${prompt.platform}

🎯 Topic: ${prompt.topic}
📝 Caption: Engaging content that speaks to ${prompt.targetAudience} with a ${prompt.tone} tone.

🏷️ Hashtags: #${prompt.topic.replace(/\s+/g, '')} #${prompt.platform} #${prompt.contentType} #trending #viral

🖼️ Image: Visual representation that captures attention and drives engagement.

⏰ Best posting time: Peak hours when your audience is most active.

💡 Engagement strategy: Ask questions, encourage comments, and create shareable content.

${prompt.callToAction || 'Ready to engage? Let&apos;s start a conversation!'} 🚀`;
    
    return {
      id: crypto.randomUUID(),
      type: 'complete-post',
      content: mockPost,
      prompt,
      metadata: {
        wordCount: mockPost.split(/\s+/).length,
        hashtagCount: (mockPost.match(/#\w+/g) || []).length,
        emojiCount: (mockPost.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length,
        estimatedReadTime: 2,
        generatedAt: new Date(),
      },
    };
  }

  static async generateVideoScript(prompt: ContentPrompt): Promise<GeneratedContent> {
    await new Promise(resolve => setTimeout(resolve, 1300));
    
    const mockScript = `🎬 Video Script: ${prompt.contentType} about ${prompt.topic}

⏱️ Duration: 30 seconds (perfect for ${prompt.platform})

🎯 Hook (0-5s): "Discover the amazing world of ${prompt.topic}!"
📱 Main Content (5-25s): Engaging explanation with visual cues and ${prompt.tone} tone
🎉 Call-to-Action (25-30s): "${prompt.callToAction || 'Follow for more amazing content!'}"

💡 Visual Suggestions: Use bright colors, smooth transitions, and text overlays
🎵 Audio: Upbeat background music that matches the ${prompt.tone} vibe
📱 Platform Optimization: Vertical format with captions for sound-off viewing`;
    
    return {
      id: crypto.randomUUID(),
      type: 'video-script',
      content: mockScript,
      prompt,
      metadata: {
        wordCount: mockScript.split(/\s+/).length,
        hashtagCount: 0,
        emojiCount: (mockScript.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length,
        estimatedReadTime: 2,
        generatedAt: new Date(),
      },
    };
  }

  static async generateCarouselContent(prompt: ContentPrompt): Promise<GeneratedContent> {
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    const mockCarousel = `🎠 Carousel Post: ${prompt.topic} for ${prompt.platform}

📱 Slide 1 (Cover): Eye-catching title with ${prompt.tone} design
🎯 Slide 2: Introduction to ${prompt.topic} - why it matters
💡 Slide 3: Key benefits and insights for ${prompt.targetAudience}
🚀 Slide 4: Actionable tips and strategies
📊 Slide 5: Real examples and case studies
🎉 Slide 6: Call-to-action: "${prompt.callToAction || 'Ready to get started?'}"
💬 Slide 7: Engagement question: "What's your experience with ${prompt.topic}?"
📱 Slide 8: Follow for more ${prompt.contentType} content
🏷️ Slide 9: Hashtag strategy and trending topics
🎯 Slide 10: Final CTA and next steps`;
    
    return {
      id: crypto.randomUUID(),
      type: 'carousel-content',
      content: mockCarousel,
      prompt,
      metadata: {
        wordCount: mockCarousel.split(/\s+/).length,
        hashtagCount: 0,
        emojiCount: (mockCarousel.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length,
        estimatedReadTime: 3,
        generatedAt: new Date(),
      },
    };
  }

  static async getContentOptimization(prompt: ContentPrompt): Promise<ContentOptimization> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      platform: prompt.platform,
      suggestions: {
        bestPostingTime: 'Peak hours: 9-11 AM and 7-9 PM EST',
        optimalLength: `${prompt.platform === 'instagram' ? '125-150 characters' : 'LinkedIn: 1300-2000 characters'}`,
        hashtagStrategy: 'Mix of 3-5 trending hashtags with 2-3 niche ones',
        engagementTips: [
          'Ask questions to encourage comments',
          'Use polls and interactive features',
          'Respond to comments within 1 hour',
          'Tag relevant accounts when appropriate'
        ],
        trendingTopics: [
          'Industry-specific trends',
          'Seasonal content opportunities',
          'Viral challenges and hashtags',
          'Breaking news in your niche'
        ],
        competitorInsights: [
          'Analyze top-performing posts',
          'Identify successful content patterns',
          'Monitor engagement strategies',
          'Track hashtag performance'
        ],
      },
      generatedAt: new Date(),
    };
  }
}

// Export the appropriate service based on environment
export const aiService = process.env.NODE_ENV === 'production' 
  ? new AIService({
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-3.5-turbo',
      maxTokens: 500,
      temperature: 0.7,
    })
  : MockAIService;
