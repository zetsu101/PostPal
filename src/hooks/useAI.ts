import { useState, useCallback, useRef } from 'react';
import { 
  ContentPrompt, 
  GeneratedContent, 
  ContentOptimization,
  aiService 
} from '@/lib/ai-service';

export interface AIState {
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  generatedContent: GeneratedContent | null;
  optimization: ContentOptimization | null;
  generationHistory: GeneratedContent[];
}

export interface AIActions {
  generateCaption: (prompt: ContentPrompt) => Promise<void>;
  generateHashtags: (prompt: ContentPrompt) => Promise<void>;
  generateImagePrompt: (prompt: ContentPrompt) => Promise<void>;
  generateCompletePost: (prompt: ContentPrompt) => Promise<void>;
  generateVideoScript: (prompt: ContentPrompt) => Promise<void>;
  generateCarouselContent: (prompt: ContentPrompt) => Promise<void>;
  getContentOptimization: (prompt: ContentPrompt) => Promise<void>;
  clearError: () => void;
  clearGeneratedContent: () => void;
  saveToHistory: (content: GeneratedContent) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

export type AIHook = AIState & AIActions;

export function useAI(): AIHook {
  const [state, setState] = useState<AIState>({
    isLoading: false,
    isGenerating: false,
    error: null,
    generatedContent: null,
    optimization: null,
    generationHistory: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear generated content
  const clearGeneratedContent = useCallback(() => {
    setState(prev => ({ ...prev, generatedContent: null }));
  }, []);

  // Save content to history
  const saveToHistory = useCallback((content: GeneratedContent) => {
    setState(prev => ({
      ...prev,
      generationHistory: [content, ...prev.generationHistory.slice(0, 9)], // Keep last 10
    }));
  }, []);

  // Remove content from history
  const removeFromHistory = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      generationHistory: prev.generationHistory.filter(item => item.id !== id),
    }));
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, generationHistory: [] }));
  }, []);

  // Generic generation function
  const generateContent = useCallback(async (
    generator: (prompt: ContentPrompt) => Promise<GeneratedContent>,
    prompt: ContentPrompt,
    contentType: string
  ) => {
    try {
      // Cancel any ongoing generation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        isLoading: true,
        isGenerating: true,
        error: null,
        generatedContent: null,
      }));

      const content = await generator(prompt);
      
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isGenerating: false,
        generatedContent: content,
      }));

      // Auto-save to history
      saveToHistory(content);

    } catch (error) {
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : `Failed to generate ${contentType}`;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isGenerating: false,
        error: errorMessage,
      }));
    }
  }, [saveToHistory]);

  // Generate caption
  const generateCaption = useCallback(async (prompt: ContentPrompt) => {
    await generateContent(
      (p) => aiService.generateCaption(p),
      prompt,
      'caption'
    );
  }, [generateContent]);

  // Generate hashtags
  const generateHashtags = useCallback(async (prompt: ContentPrompt) => {
    await generateContent(
      (p) => aiService.generateHashtags(p),
      prompt,
      'hashtags'
    );
  }, [generateContent]);

  // Generate image prompt
  const generateImagePrompt = useCallback(async (prompt: ContentPrompt) => {
    await generateContent(
      (p) => aiService.generateImagePrompt(p),
      prompt,
      'image prompt'
    );
  }, [generateContent]);

  // Generate complete post
  const generateCompletePost = useCallback(async (prompt: ContentPrompt) => {
    await generateContent(
      (p) => aiService.generateCompletePost(p),
      prompt,
      'complete post'
    );
  }, [generateContent]);

  // Generate video script
  const generateVideoScript = useCallback(async (prompt: ContentPrompt) => {
    await generateContent(
      (p) => aiService.generateVideoScript(p),
      prompt,
      'video script'
    );
  }, [generateContent]);

  // Generate carousel content
  const generateCarouselContent = useCallback(async (prompt: ContentPrompt) => {
    await generateContent(
      (p) => aiService.generateCarouselContent(p),
      prompt,
      'carousel content'
    );
  }, [generateContent]);

  // Get content optimization
  const getContentOptimization = useCallback(async (prompt: ContentPrompt) => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      const optimization = await aiService.getContentOptimization(prompt);

      setState(prev => ({
        ...prev,
        isLoading: false,
        optimization,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get optimization suggestions';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, []);

  return {
    ...state,
    generateCaption,
    generateHashtags,
    generateImagePrompt,
    generateCompletePost,
    generateVideoScript,
    generateCarouselContent,
    getContentOptimization,
    clearError,
    clearGeneratedContent,
    saveToHistory,
    removeFromHistory,
    clearHistory,
  };
}

// Specialized hooks for specific content types
export function useAICaption() {
  const { generateCaption, ...rest } = useAI();
  return { generateCaption, ...rest };
}

export function useAIHashtags() {
  const { generateHashtags, ...rest } = useAI();
  return { generateHashtags, ...rest };
}

export function useAIImagePrompt() {
  const { generateImagePrompt, ...rest } = useAI();
  return { generateImagePrompt, ...rest };
}

export function useAICompletePost() {
  const { generateCompletePost, ...rest } = useAI();
  return { generateCompletePost, ...rest };
}

export function useAIVideoScript() {
  const { generateVideoScript, ...rest } = useAI();
  return { generateVideoScript, ...rest };
}

export function useAICarouselContent() {
  const { generateCarouselContent, ...rest } = useAI();
  return { generateCarouselContent, ...rest };
}

export function useAIOptimization() {
  const { getContentOptimization, ...rest } = useAI();
  return { getContentOptimization, ...rest };
}
