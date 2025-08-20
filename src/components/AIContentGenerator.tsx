"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw, 
  Save, 
  Share2, 
  Zap,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  MessageCircle,
  Image as ImageIcon,
  Video,
  FileText,
  Hash,
  Target,
  Palette,
  Clock,
  TrendingUp,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { ContentPrompt, GeneratedContent } from '@/lib/ai-service';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-700' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'from-blue-400 to-blue-500' },
  { id: 'tiktok', name: 'TikTok', icon: MessageCircle, color: 'from-black to-gray-800' },
] as const;

const CONTENT_TYPES = [
  { id: 'post', name: 'Post', icon: FileText, description: 'Standard social media post' },
  { id: 'story', name: 'Story', icon: ImageIcon, description: 'Temporary story content' },
  { id: 'carousel', name: 'Carousel', icon: BarChart3, description: 'Multi-slide post' },
  { id: 'video', name: 'Video', icon: Video, description: 'Video content' },
  { id: 'reel', name: 'Reel', icon: Video, description: 'Short-form video' },
] as const;

const TONES = [
  { id: 'professional', name: 'Professional', description: 'Formal and business-like' },
  { id: 'casual', name: 'Casual', description: 'Relaxed and friendly' },
  { id: 'friendly', name: 'Friendly', description: 'Warm and approachable' },
  { id: 'humorous', name: 'Humorous', description: 'Funny and entertaining' },
  { id: 'inspirational', name: 'Inspirational', description: 'Motivating and uplifting' },
  { id: 'educational', name: 'Educational', description: 'Informative and instructive' },
] as const;

export default function AIContentGenerator() {
  const { addToast } = useToast();
  const {
    isLoading,
    isGenerating,
    error,
    generatedContent,
    optimization,
    generationHistory,
    generateCaption,
    generateHashtags,
    generateImagePrompt,
    generateCompletePost,
    generateVideoScript,
    generateCarouselContent,
    getContentOptimization,
    clearError,
    clearGeneratedContent,
    removeFromHistory,
    clearHistory,
  } = useAI();

  const [formData, setFormData] = useState<ContentPrompt>({
    topic: '',
    platform: 'instagram',
    contentType: 'post',
    tone: 'professional',
    targetAudience: '',
    hashtagCount: 10,
    language: 'English',
    includeEmojis: true,
    callToAction: '',
  });

  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'optimization'>('generator');
  const [selectedGenerationType, setSelectedGenerationType] = useState<'caption' | 'hashtags' | 'image-prompt' | 'complete-post' | 'video-script' | 'carousel-content'>('caption');

  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, error, clearError]);

  const handleInputChange = (field: keyof ContentPrompt, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      addToast({
        title: 'Topic Required',
        message: 'Please enter a topic for content generation',
        type: 'error',
      });
      return;
    }

    try {
      switch (selectedGenerationType) {
        case 'caption':
          await generateCaption(formData);
          break;
        case 'hashtags':
          await generateHashtags(formData);
          break;
        case 'image-prompt':
          await generateImagePrompt(formData);
          break;
        case 'complete-post':
          await generateCompletePost(formData);
          break;
        case 'video-script':
          await generateVideoScript(formData);
          break;
        case 'carousel-content':
          await generateCarouselContent(formData);
          break;
      }

      addToast({
        title: 'Content Generated!',
        message: `Your ${selectedGenerationType.replace('-', ' ')} is ready`,
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Generation Failed',
        message: 'Please try again or check your inputs',
        type: 'error',
      });
    }
  };

  const handleOptimize = async () => {
    if (!formData.topic.trim()) {
      addToast({
        title: 'Topic Required',
        message: 'Please enter a topic for optimization',
        type: 'error',
      });
      return;
    }

    try {
      await getContentOptimization(formData);
      addToast({
        title: 'Optimization Complete!',
        message: 'Your content optimization suggestions are ready',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Optimization Failed',
        message: 'Please try again or check your inputs',
        type: 'error',
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast({
        title: 'Copied!',
        message: 'Content copied to clipboard',
        type: 'success',
      });
    } catch (error) {
      addToast({
        title: 'Copy Failed',
        message: 'Please copy manually',
        type: 'error',
      });
    }
  };

  const downloadContent = (content: GeneratedContent) => {
    const blob = new Blob([content.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.type}-${content.prompt.platform}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

          addToast({
        title: 'Downloaded!',
        message: 'Content saved to your device',
        type: 'success',
      });
  };

  const getGenerationTypeIcon = (type: string) => {
    switch (type) {
      case 'caption': return FileText;
      case 'hashtags': return Hash;
      case 'image-prompt': return ImageIcon;
      case 'complete-post': return FileText;
      case 'video-script': return Video;
      case 'carousel-content': return BarChart3;
      default: return FileText;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          AI Content Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create engaging social media content in seconds with AI-powered generation. 
          Get captions, hashtags, image prompts, and complete posts optimized for your platform.
        </p>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="bg-gray-100 rounded-xl p-1">
          {[
            { id: 'generator', name: 'Content Generator', icon: Sparkles },
            { id: 'history', name: 'Generation History', icon: Clock },
            { id: 'optimization', name: 'Optimization', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'generator' | 'history' | 'optimization')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content Generator Tab */}
      {activeTab === 'generator' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Form Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Parameters</h2>
              
              {/* Topic Input */}
              <div className="space-y-4">
                <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                      What&apos;s your content about? *
                    </label>
                  <textarea
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    placeholder="e.g., AI in business, sustainable living, remote work tips..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Platform
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {PLATFORMS.map((platform) => {
                      const Icon = platform.icon;
                      return (
                        <button
                          key={platform.id}
                          onClick={() => handleInputChange('platform', platform.id)}
                          className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                            formData.platform === platform.id
                              ? `border-purple-500 bg-gradient-to-br ${platform.color} text-white`
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">{platform.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Content Type
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {CONTENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => handleInputChange('contentType', type.id)}
                          className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                            formData.contentType === type.id
                              ? 'border-purple-500 bg-purple-50 text-purple-600'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-1" />
                          <span className="text-xs font-medium">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tone Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tone & Voice
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TONES.map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() => handleInputChange('tone', tone.id)}
                        className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                          formData.tone === tone.id
                            ? 'border-purple-500 bg-purple-50 text-purple-600'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <div className="font-medium">{tone.name}</div>
                        <div className="text-xs opacity-75">{tone.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      placeholder="e.g., entrepreneurs, students..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hashtag Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.hashtagCount}
                      onChange={(e) => handleInputChange('hashtagCount', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => handleInputChange('language', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Italian">Italian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call to Action
                    </label>
                    <input
                      type="text"
                      value={formData.callToAction}
                      onChange={(e) => handleInputChange('callToAction', e.target.value)}
                      placeholder="e.g., Share your thoughts below!"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="includeEmojis"
                    type="checkbox"
                    checked={formData.includeEmojis}
                    onChange={(e) => handleInputChange('includeEmojis', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includeEmojis" className="ml-2 text-sm text-gray-700">
                    Include emojis for better engagement
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Generation Section */}
          <div className="space-y-6">
            {/* Generation Type Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What would you like to generate?</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'caption', name: 'Caption', icon: FileText, description: 'Engaging post text' },
                  { id: 'hashtags', name: 'Hashtags', icon: Hash, description: 'Trending hashtags' },
                  { id: 'image-prompt', name: 'Image Prompt', icon: ImageIcon, description: 'Visual description' },
                  { id: 'complete-post', name: 'Complete Post', icon: FileText, description: 'Full post package' },
                  { id: 'video-script', name: 'Video Script', icon: Video, description: 'Video content script' },
                  { id: 'carousel-content', name: 'Carousel', icon: BarChart3, description: 'Multi-slide content' },
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedGenerationType(type.id as 'caption' | 'hashtags' | 'image-prompt' | 'complete-post' | 'video-script' | 'carousel-content')}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedGenerationType === type.id
                          ? 'border-purple-500 bg-purple-50 text-purple-600'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <div className="font-medium text-sm">{type.name}</div>
                      <div className="text-xs opacity-75 text-center">{type.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isLoading || isGenerating || !formData.topic.trim()}
              loading={isGenerating}
              className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating {selectedGenerationType.replace('-', ' ')}...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate {selectedGenerationType.replace('-', ' ')}
                </>
              )}
            </Button>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Content Display */}
            <AnimatePresence>
              {generatedContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {(() => {
                          const Icon = getGenerationTypeIcon(generatedContent.type);
                          return <Icon className="w-5 h-5 text-purple-600" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {generatedContent.type.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Generated for {generatedContent.prompt.platform}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{generatedContent.metadata.estimatedReadTime} min read</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {generatedContent.content}
                    </pre>
                  </div>

                  {/* Content Metadata */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{generatedContent.metadata.wordCount} words</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{generatedContent.metadata.hashtagCount} hashtags</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">😊</span>
                      <span className="text-gray-600">{generatedContent.metadata.emojiCount} emojis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{generatedContent.metadata.estimatedReadTime} min read</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(generatedContent.content)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadContent(generatedContent)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => {
                        // Share functionality would go here
                                                 addToast({
                           title: 'Share Feature',
                           message: 'Coming soon!',
                           type: 'info',
                         });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Generation History</h2>
            {generationHistory.length > 0 && (
              <Button
                onClick={clearHistory}
                variant="outline"
                size="sm"
              >
                Clear History
              </Button>
            )}
          </div>

          {generationHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content generated yet</h3>
              <p className="text-gray-500">Start creating content to see your generation history here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generationHistory.map((content) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {(() => {
                          const Icon = getGenerationTypeIcon(content.type);
                          return <Icon className="w-4 h-4 text-purple-600" />;
                        })()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {content.type.replace('-', ' ')}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromHistory(content.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                                              Platform: <span className="font-medium">{content.prompt.platform}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Tone: <span className="font-medium">{content.prompt.tone}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {content.metadata.wordCount} words
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-800 line-clamp-3">
                      {content.content}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(content.content)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => downloadContent(content)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Optimization Tab */}
      {activeTab === 'optimization' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Optimization</h2>
            <p className="text-gray-600">
              Get AI-powered suggestions to optimize your content for maximum engagement
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form for Optimization */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Optimization Tips</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Topic
                  </label>
                  <textarea
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    placeholder="What content would you like to optimize?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => handleInputChange('platform', e.target.value as 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'tiktok')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {PLATFORMS.map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={handleOptimize}
                  disabled={isLoading || !formData.topic.trim()}
                  loading={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Get Optimization Tips
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Optimization Results */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Suggestions</h3>
              
              {!optimization ? (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Enter a topic and platform to get optimization suggestions</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Best Posting Time */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Best Posting Time</span>
                    </div>
                    <p className="text-blue-800">{optimization.suggestions.bestPostingTime}</p>
                  </div>

                  {/* Optimal Length */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-900">Optimal Content Length</span>
                    </div>
                    <p className="text-green-800">{optimization.suggestions.optimalLength} characters</p>
                  </div>

                  {/* Hashtag Strategy */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-900">Hashtag Strategy</span>
                    </div>
                    <p className="text-purple-800">{optimization.suggestions.hashtagStrategy}</p>
                  </div>

                  {/* Engagement Tips */}
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-900">Engagement Tips</span>
                    </div>
                    <ul className="text-yellow-800 space-y-1">
                      {optimization.suggestions.engagementTips.map((tip, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Trending Topics */}
                  <div className="bg-pink-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                      <span className="font-semibold text-pink-900">Trending Topics</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {optimization.suggestions.trendingTopics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-pink-100 text-pink-800 rounded-lg text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 