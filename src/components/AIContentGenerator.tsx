"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EditPostModal from "./EditPostModal";

interface PostIdea {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  platform: string;
  contentType: string;
  engagement: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export default function AIContentGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [postIdeas, setPostIdeas] = useState<PostIdea[]>([]);
  const [editingPost, setEditingPost] = useState<PostIdea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const contentTypes: ContentType[] = [
    { id: "educational", name: "Educational", description: "Teach your audience something new", icon: "📚", color: "from-[#60A5FA] to-[#93C5FD]" },
    { id: "behind-scenes", name: "Behind the Scenes", description: "Show your process and team", icon: "🎬", color: "from-[#FF6B6B] to-[#FF8E8E]" },
    { id: "tips", name: "Tips & Tricks", description: "Share valuable insights", icon: "💡", color: "from-[#FACC15] to-[#FDE047]" },
    { id: "story", name: "Story", description: "Share personal experiences", icon: "📖", color: "from-[#34D399] to-[#6EE7B7]" },
    { id: "promotional", name: "Promotional", description: "Showcase your products/services", icon: "🎯", color: "from-[#A78BFA] to-[#C4B5FD]" },
    { id: "trending", name: "Trending", description: "Join current conversations", icon: "🔥", color: "from-[#FB7185] to-[#FDA4AF]" },
  ];

  const platforms: Platform[] = [
    { id: "instagram", name: "Instagram", icon: "📸", color: "from-pink-400 to-purple-500" },
    { id: "linkedin", name: "LinkedIn", icon: "💼", color: "from-blue-500 to-blue-600" },
    { id: "tiktok", name: "TikTok", icon: "🎵", color: "from-black to-gray-800" },
    { id: "twitter", name: "Twitter/X", icon: "🐦", color: "from-black to-gray-900" },
    { id: "facebook", name: "Facebook", icon: "📘", color: "from-blue-600 to-blue-700" },
  ];

  const trendingTopics = [
    "AI and Technology", "Sustainability", "Mental Health", "Remote Work", 
    "Personal Development", "Creativity", "Business Growth", "Wellness"
  ];

  // Mock data for demonstration (replace with actual OpenAI API call)
  const generatePostIdeas = async () => {
    setIsLoading(true);
    setError("");
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockIdeas: PostIdea[] = [
      {
        id: "1",
        title: "Behind the Scenes: Our Creative Process",
        caption: "Ever wondered how we bring your ideas to life? Here&apos;s a peek into our creative process! From initial concept to final design, every step is crafted with care. What&apos;s your favorite part of the creative journey? 🤔✨",
        hashtags: ["#BehindTheScenes", "#CreativeProcess", "#DesignLife", "#BrandStory"],
        imagePrompt: "A clean workspace with design tools, mood boards, and creative materials scattered around, soft natural lighting, professional photography style",
        platform: "Instagram",
        contentType: "behind-scenes",
        engagement: 8.5,
        difficulty: "Easy"
      },
      {
        id: "2",
        title: "Tip Tuesday: Boost Your Engagement",
        caption: "Tuesday Tip: Engage with your audience by asking questions! People love to share their thoughts and experiences. Try ending your posts with a question that encourages conversation. What&apos;s your go-to engagement strategy? 💬",
        hashtags: ["#TipTuesday", "#Engagement", "#SocialMediaTips", "#Community"],
        imagePrompt: "A smartphone showing a social media post with engagement metrics, bright and colorful design, modern flat illustration style",
        platform: "Instagram",
        contentType: "tips",
        engagement: 9.2,
        difficulty: "Medium"
      },
      {
        id: "3",
        title: "Client Success Story: From Idea to Reality",
        caption: "Nothing makes us happier than seeing our clients succeed! This project started as a simple idea and grew into something amazing. Your vision + our expertise = magic! What&apos;s your next big idea? 🚀",
        hashtags: ["#ClientSuccess", "#SuccessStory", "#Collaboration", "#Results"],
        imagePrompt: "Before and after comparison of a brand transformation, professional photography, clean layout with success metrics",
        platform: "LinkedIn",
        contentType: "story",
        engagement: 7.8,
        difficulty: "Hard"
      },
      {
        id: "4",
        title: "The Future of AI in Creative Industries",
        caption: "AI isn&apos;t replacing creativity—it&apos;s amplifying it! Here&apos;s how we&apos;re using AI to enhance our creative process and deliver better results for our clients. The future is collaborative! 🤖✨",
        hashtags: ["#AI", "#Creativity", "#Innovation", "#FutureOfWork"],
        imagePrompt: "Futuristic workspace with AI elements, creative tools, and human-AI collaboration, modern tech aesthetic",
        platform: "LinkedIn",
        contentType: "educational",
        engagement: 8.9,
        difficulty: "Medium"
      }
    ];
    
    setPostIdeas(mockIdeas);
    setIsLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        // You could add a toast notification here
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy text to clipboard. Please try again.');
    }
  };

  const handleSave = (post: PostIdea) => {
    // TODO: Save to saved posts or calendar
    console.log('Saving post:', post);
  };

  const handleEdit = (post: PostIdea) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleSaveEdit = (updatedPost: PostIdea) => {
    setPostIdeas(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-[#34D399]";
      case "Medium": return "text-[#FACC15]";
      case "Hard": return "text-[#FF6B6B]";
      default: return "text-[#6B7280]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Generate Section */}
      <div className="bg-gradient-to-r from-[#F9FAFB] to-[#E5E7EB] rounded-2xl p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-[#1F2937] mb-2">Generate AI Content</h3>
          <p className="text-[#6B7280]">Choose your content type and platform for personalized ideas</p>
        </div>

        {/* Content Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">Content Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {contentTypes.map((type) => (
              <motion.button
                key={type.id}
                onClick={() => setSelectedContentType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  selectedContentType === type.id
                    ? 'border-[#C7D2FE] bg-gradient-to-r from-[#E0E7FF]/10 to-[#C7D2FE]/10'
                    : 'border-gray-200 hover:border-[#C7D2FE]/50 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center`}>
                    <span className="text-lg">{type.icon}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2937] text-sm">{type.name}</div>
                    <div className="text-xs text-[#6B7280]">{type.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#1F2937] mb-3">Target Platform</label>
          <div className="flex flex-wrap gap-3">
            {platforms.map((platform) => (
              <motion.button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`px-4 py-2 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 ${
                  selectedPlatform === platform.id
                    ? 'border-[#C7D2FE] bg-gradient-to-r from-[#E0E7FF]/10 to-[#C7D2FE]/10'
                    : 'border-gray-200 hover:border-[#C7D2FE]/50 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-6 h-6 bg-gradient-to-r ${platform.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-sm">{platform.icon}</span>
                </div>
                <span className="font-medium text-sm">{platform.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <motion.div
          initial={false}
          animate={{ height: showAdvanced ? "auto" : 0 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-2">Custom Prompt (Optional)</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add specific details or requirements for your content..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#FF6B6B] focus:outline-none resize-none"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-2">Trending Topics</label>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic) => (
                  <span key={topic} className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] rounded-full text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toggle Advanced Options */}
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[#FF6B6B] text-sm font-medium hover:underline"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </button>
        </div>

        {/* Generate Button */}
        <div className="text-center mt-6">
          <motion.button
            onClick={generatePostIdeas}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] hover:from-[#C7D2FE] hover:to-[#E0E7FF] disabled:from-[#9CA3AF] disabled:to-[#9CA3AF] text-[#1F2937] font-semibold px-8 py-4 rounded-xl transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Ideas...
              </>
            ) : (
              <>
                <span className="text-xl">✨</span>
                Generate AI Content
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generated Post Ideas */}
      <AnimatePresence>
        {postIdeas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1F2937]">Generated Ideas ({postIdeas.length})</h3>
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <span>Sort by:</span>
                <select className="border border-gray-200 rounded-lg px-2 py-1 text-sm">
                  <option>Engagement</option>
                  <option>Difficulty</option>
                  <option>Platform</option>
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {postIdeas.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#F3F4F6] to-[#E5E7EB] px-6 py-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${
                          platforms.find(p => p.id === post.platform.toLowerCase())?.color || "from-gray-400 to-gray-500"
                        } rounded-lg flex items-center justify-center`}>
                          <span className="text-sm">{platforms.find(p => p.id === post.platform.toLowerCase())?.icon || "📱"}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-[#1F2937] text-sm">{post.platform}</div>
                          <div className="text-xs text-[#6B7280]">{post.contentType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${getDifficultyColor(post.difficulty)}`}>
                          {post.difficulty}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                          <span>📈</span>
                          <span>{post.engagement}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-[#1F2937] text-lg leading-tight">{post.title}</h3>
                    
                    <p className="text-[#6B7280] text-sm leading-relaxed">
                      {post.caption}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags.map((tag) => (
                        <span key={tag} className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Image Prompt */}
                    <div className="bg-[#F9FAFB] p-3 rounded-xl">
                      <p className="text-xs text-[#6B7280] font-medium mb-1">🎨 Image Prompt:</p>
                      <p className="text-xs text-[#6B7280]">{post.imagePrompt}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <motion.button
                        onClick={() => copyToClipboard(post.caption)}
                        aria-label={`Copy caption for ${post.title}`}
                        className="flex-1 bg-[#60A5FA] text-white text-xs font-medium py-2 rounded-lg hover:bg-[#3B82F6] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Copy
                      </motion.button>
                      <motion.button
                        onClick={() => handleEdit(post)}
                        aria-label={`Edit post: ${post.title}`}
                        className="flex-1 bg-[#34D399] text-white text-xs font-medium py-2 rounded-lg hover:bg-[#10B981] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => handleSave(post)}
                        aria-label={`Save post: ${post.title}`}
                        className="flex-1 bg-[#FACC15] text-white text-xs font-medium py-2 rounded-lg hover:bg-[#EAB308] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Save
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <EditPostModal
        post={editingPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEdit}
      />
    </div>
  );
} 