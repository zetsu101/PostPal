import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (server-side only) - only when needed
let openai: OpenAI | null = null;

function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      prompt, 
      model = 'gpt-3.5-turbo',
      maxTokens = 500,
      temperature = 0.7 
    } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    let systemPrompt = '';
    let userPrompt = '';

    // Build prompts based on content type
    switch (type) {
      case 'caption':
        systemPrompt = `You are an expert social media content creator specializing in ${prompt.platform} ${prompt.contentType}s. Create engaging, platform-optimized content.`;
        userPrompt = `Create a ${prompt.contentType} about "${prompt.topic}" for ${prompt.platform}. Tone: ${prompt.tone}, Target audience: ${prompt.targetAudience}, Language: ${prompt.language}, Include emojis: ${prompt.includeEmojis ? 'Yes' : 'No'}, Call to action: ${prompt.callToAction || 'Engage with the content'}`;
        break;
      
      case 'hashtags':
        systemPrompt = 'You are a social media hashtag expert. Generate relevant, trending hashtags.';
        userPrompt = `Generate ${prompt.hashtagCount} relevant hashtags for a ${prompt.contentType} about "${prompt.topic}" for ${prompt.platform}. Make them trending and relevant, match the ${prompt.tone} tone, target audience: ${prompt.targetAudience}, language: ${prompt.language}. Return only the hashtags separated by spaces.`;
        break;
      
      case 'image-prompt':
        systemPrompt = 'You are a visual design expert. Create detailed image generation prompts.';
        userPrompt = `Create a detailed image generation prompt for a ${prompt.contentType} about "${prompt.topic}" for ${prompt.platform}. Style: ${prompt.tone} and engaging, target audience: ${prompt.targetAudience}, include specific visual elements, colors, composition, and mood. Return only the image description.`;
        break;
      
      case 'complete-post':
        systemPrompt = `You are an expert social media content creator specializing in ${prompt.platform} ${prompt.contentType}s. Create comprehensive content.`;
        userPrompt = `Create a complete ${prompt.contentType} about "${prompt.topic}" for ${prompt.platform}. Include: 1. Engaging caption, 2. ${prompt.hashtagCount} relevant hashtags, 3. Image description, 4. Posting time recommendation, 5. Engagement strategy. Tone: ${prompt.tone}, target audience: ${prompt.targetAudience}, language: ${prompt.language}, include emojis: ${prompt.includeEmojis ? 'Yes' : 'No'}, call to action: ${prompt.callToAction || 'Engage with the content'}`;
        break;
      
      case 'video-script':
        systemPrompt = 'You are a video content expert. Create engaging video scripts.';
        userPrompt = `Create a ${prompt.contentType} video script about "${prompt.topic}" for ${prompt.platform}. Duration: 15-60 seconds, tone: ${prompt.tone}, target audience: ${prompt.targetAudience}, include hook, main content, call-to-action, add timing cues and visual suggestions. Return the script with timing and visual cues.`;
        break;
      
      case 'carousel-content':
        systemPrompt = 'You are a carousel content expert. Create engaging multi-slide posts.';
        userPrompt = `Create a carousel post with 5-10 slides about "${prompt.topic}" for ${prompt.platform}. Each slide should have a clear focus, include slide titles and content, tone: ${prompt.tone}, target audience: ${prompt.targetAudience}, make it educational and engaging, include a compelling cover slide. Return each slide with title and content, separated by "---".`;
        break;
      
      case 'optimization':
        systemPrompt = 'You are a social media optimization expert.';
        userPrompt = `Analyze and provide optimization suggestions for ${prompt.platform} content about "${prompt.topic}". Provide: 1. Best posting time for ${prompt.platform}, 2. Optimal content length, 3. Hashtag strategy, 4. Engagement tips, 5. Trending topics in this niche, 6. Competitor analysis insights. Return as structured data.`;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid content type' },
          { status: 400 }
        );
    }

          const openaiClient = getOpenAI();
      if (!openaiClient) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        );
      }

      const completion = await openaiClient.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: maxTokens,
      temperature,
    });

    const content = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      content,
      type,
      prompt
    });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
