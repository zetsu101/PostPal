"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface EditPostModalProps {
  post: PostIdea | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPost: PostIdea) => void;
}

export default function EditPostModal({ post, isOpen, onClose, onSave }: EditPostModalProps) {
  const [formData, setFormData] = useState<PostIdea | null>(null);
  const [hashtagsInput, setHashtagsInput] = useState("");

  useEffect(() => {
    if (post) {
      setFormData(post);
      setHashtagsInput(post.hashtags.join(" "));
    }
  }, [post]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSave = () => {
    if (formData) {
      const updatedPost = {
        ...formData,
        hashtags: hashtagsInput.split(" ").filter(tag => tag.startsWith("#"))
      };
      onSave(updatedPost);
      onClose();
    }
  };



  if (!isOpen || !formData) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-[9999]"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl mx-4 h-[90vh] flex"
          style={{ 
            position: 'relative', 
            zIndex: 10000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left Side - Post Editor */}
          <div className="flex-1 p-6 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">✏️</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Create Post
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-gray-600 text-lg">✕</span>
              </button>
            </div>

            {/* Media Upload Area */}
            <div className="flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-2xl">📷</span>
                </div>
                <p className="text-gray-600 font-medium">Drop your photo or video here</p>
                <p className="text-gray-500 text-sm">or click to browse</p>
              </div>
            </div>

            {/* Platform Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Post to Platforms
              </label>
              <div className="flex gap-2 flex-wrap">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm">Instagram</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300">Facebook</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300">TikTok</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300">LinkedIn</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300">Twitter</button>
              </div>
            </div>

            {/* Caption with AI Help */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Caption
                </label>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  ✨ AI Help
                </button>
              </div>
              <textarea
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none text-base"
                placeholder="Write your caption here... Use AI Help to generate engaging content!"
              />
            </div>

            {/* Hashtags */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hashtags
              </label>
              <input
                type="text"
                value={hashtagsInput}
                onChange={(e) => setHashtagsInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-base"
                placeholder="#hashtag1 #hashtag2 #hashtag3"
              />
            </div>

            {/* Schedule & Actions */}
            <div className="flex gap-3">
              <button className="flex-1 h-12 bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all text-base">
                📅 Schedule Post
              </button>
              <button
                onClick={handleSave}
                className="flex-1 h-12 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-base shadow-lg"
              >
                Post Now
              </button>
            </div>
          </div>

          {/* Right Side - Profile Preview */}
          <div className="w-80 p-6 bg-gray-50 rounded-r-3xl">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Profile Preview</h3>
              <p className="text-sm text-gray-600">How your post will look</p>
            </div>

            {/* Instagram Profile Preview */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              {/* Profile Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-900">@yourbrand</p>
                  <p className="text-xs text-gray-500">Sponsored</p>
                </div>
              </div>

              {/* Post Image Placeholder */}
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-3 flex items-center justify-center">
                <span className="text-gray-400 text-2xl">📷</span>
              </div>

              {/* Post Content */}
              <div className="space-y-2">
                <p className="text-sm text-gray-900 font-medium">
                  {formData.title || "Behind the Scenes: Our Creative Process"}
                </p>
                <p className="text-sm text-gray-600">
                  {formData.caption || "Ever wondered how we bring your ideas to life? Here's a peek into our creative process! ✨"}
                </p>
                <p className="text-sm text-blue-600">
                  {formData.hashtags.join(" ") || "#BehindTheScenes #CreativeProcess"}
                </p>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>❤️ 1.2k</span>
                  <span>💬 48</span>
                  <span>📤 Share</span>
                </div>
                <span className="text-gray-400">💾</span>
              </div>
            </div>

            {/* Calendar Preview */}
            <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3">Content Calendar</h4>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                  <div key={day} className="text-center text-gray-500 font-medium py-1">
                    {day}
                  </div>
                ))}
                {Array.from({length: 35}, (_, i) => (
                  <div key={i} className={`text-center py-1 rounded ${
                    i === 15 ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-400'
                  }`}>
                    {i < 31 ? i + 1 : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 