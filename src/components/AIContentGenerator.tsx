"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import EditPostModal from "./EditPostModal";

interface PostIdea {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  platform: string;
}

export default function AIContentGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [postIdeas, setPostIdeas] = useState<PostIdea[]>([]);
  const [editingPost, setEditingPost] = useState<PostIdea | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        caption: "Ever wondered how we bring your ideas to life? Here's a peek into our creative process! From initial concept to final design, every step is crafted with care. What's your favorite part of the creative journey? 🤔✨",
        hashtags: ["#BehindTheScenes", "#CreativeProcess", "#DesignLife", "#BrandStory"],
        imagePrompt: "A clean workspace with design tools, mood boards, and creative materials scattered around, soft natural lighting, professional photography style",
        platform: "Instagram"
      },
      {
        id: "2",
        title: "Tip Tuesday: Boost Your Engagement",
        caption: "Tuesday Tip: Engage with your audience by asking questions! People love to share their thoughts and experiences. Try ending your posts with a question that encourages conversation. What's your go-to engagement strategy? 💬",
        hashtags: ["#TipTuesday", "#Engagement", "#SocialMediaTips", "#Community"],
        imagePrompt: "A smartphone showing a social media post with engagement metrics, bright and colorful design, modern flat illustration style",
        platform: "Instagram"
      },
      {
        id: "3",
        title: "Client Success Story: From Idea to Reality",
        caption: "Nothing makes us happier than seeing our clients succeed! This project started as a simple idea and grew into something amazing. Your vision + our expertise = magic! What's your next big idea? 🚀",
        hashtags: ["#ClientSuccess", "#SuccessStory", "#Collaboration", "#Results"],
        imagePrompt: "Before and after comparison of a brand transformation, professional photography, clean layout with success metrics",
        platform: "LinkedIn"
      }
    ];
    
    setPostIdeas(mockIdeas);
    setIsLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSave = (post: PostIdea) => {
    // TODO: Save to saved posts or calendar
    console.log('Saving post:', post);
  };

  const handleEdit = (post: PostIdea) => {
    console.log('Edit button clicked for post:', post);
    setEditingPost(post);
    setIsModalOpen(true);
    console.log('Modal state set to open');
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

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={generatePostIdeas}
          disabled={isLoading}
          className="bg-[#FF6B6B] hover:bg-[#EF4444] disabled:bg-[#9CA3AF] text-white font-semibold px-8 py-3 rounded-full transition-colors flex items-center gap-2 mx-auto"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Generating Ideas...
            </>
          ) : (
            <>
              ✨ Generate Post Ideas
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Generated Post Ideas */}
      {postIdeas.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {postIdeas.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden"
            >
              {/* Platform Badge */}
              <div className="bg-[#F3F4F6] px-4 py-2 border-b border-[#E5E7EB]">
                <span className="text-sm font-medium text-[#6B7280]">{post.platform}</span>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <h3 className="font-semibold text-[#1F2937] text-lg">{post.title}</h3>
                
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
                <div className="bg-[#F9FAFB] p-3 rounded-lg">
                  <p className="text-xs text-[#6B7280] font-medium mb-1">Image Prompt:</p>
                  <p className="text-xs text-[#6B7280]">{post.imagePrompt}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => copyToClipboard(post.caption)}
                    className="flex-1 bg-[#60A5FA] text-white text-xs font-medium py-2 rounded-lg hover:bg-[#3B82F6] transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleEdit(post)}
                    className="flex-1 bg-[#34D399] text-white text-xs font-medium py-2 rounded-lg hover:bg-[#10B981] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleSave(post)}
                    className="flex-1 bg-[#FACC15] text-white text-xs font-medium py-2 rounded-lg hover:bg-[#EAB308] transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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