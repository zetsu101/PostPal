"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import FileUploader from "@/components/FileUploader";
import { useAuth } from "@/contexts/AuthContext";

interface PostData {
  title: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  platform: string;
  contentType: string;
  tone: string;
  targetAudience: string;
}

interface UploadedFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export default function CreatePage() {
  const { user } = useAuth();
  const [postData, setPostData] = useState<PostData>({
    title: "",
    caption: "",
    hashtags: [],
    imagePrompt: "",
    platform: "Instagram",
    contentType: "post",
    tone: "professional",
    targetAudience: "general"
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [scheduleType, setScheduleType] = useState("draft");
  const [scheduledTime, setScheduledTime] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content templates
  const templates: ContentTemplate[] = [
    { id: "product-showcase", name: "Product Showcase", description: "Highlight your products with engaging visuals", icon: "📦", category: "business" },
    { id: "behind-scenes", name: "Behind the Scenes", description: "Share your creative process and team culture", icon: "🎬", category: "lifestyle" },
    { id: "user-generated", name: "User Generated Content", description: "Feature customer testimonials and reviews", icon: "👥", category: "social" },
    { id: "educational", name: "Educational Post", description: "Share valuable tips and industry insights", icon: "📚", category: "education" },
    { id: "promotional", name: "Promotional Offer", description: "Announce deals, discounts, and special offers", icon: "🎉", category: "business" },
    { id: "storytelling", name: "Storytelling", description: "Share your brand story and values", icon: "📖", category: "brand" }
  ];

  // AI Content Generation
  const generateAIContent = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setPostData({
        ...postData,
        caption: "🚀 Exciting news! We're launching something amazing that will transform your social media game. Stay tuned for the big reveal! ✨\n\nWhat do you think it could be? Drop your guesses below! 👇\n\n#LaunchDay #Innovation #SocialMedia #Excited #ComingSoon",
        hashtags: ["#LaunchDay", "#Innovation", "#SocialMedia", "#Excited", "#ComingSoon"],
        imagePrompt: "A modern, clean workspace with a laptop showing social media analytics, surrounded by creative elements like colorful sticky notes, a coffee cup, and natural lighting"
      });
      setIsGenerating(false);
      setShowAIGenerator(false);
    }, 2000);
  };

  // File upload handling
  const handleUploadComplete = (files: UploadedFile[]) => {
    setUploadedFiles(prev => [...files, ...prev]);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  if (!user) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to create content</h1>
          <a href="/login" className="text-blue-600 hover:underline">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Navigation */}
      <div className={`transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col relative items-center ${sidebarOpen ? "w-64 px-4" : "w-20 px-0"}`}>
        <div className="fixed top-4 left-4 z-50 bg-white border border-gray-300 p-2 rounded-xl shadow-lg">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="relative w-10 h-10 rounded-full bg-transparent hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <span className={`absolute w-6 h-0.5 bg-black rounded transition-all duration-300 origin-center ${sidebarOpen ? "rotate-45 translate-y-1.5" : "-translate-y-2"}`}></span>
            <span className={`absolute w-6 h-0.5 bg-black rounded transition-all duration-300 origin-center ${sidebarOpen ? "opacity-0" : ""}`}></span>
            <span className={`absolute w-6 h-0.5 bg-black rounded transition-all duration-300 origin-center ${sidebarOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-2"}`}></span>
          </button>
        </div>

        <nav className="flex-1 flex flex-col items-center justify-center gap-6 mt-20">
          <a href="/dashboard" className={`flex items-center gap-4 w-full py-3 px-3 rounded-xl text-gray-600 hover:text-[#87CEFA] hover:bg-[#87CEFA]/10 transition-all ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span className="text-xl">🏠</span>
            {sidebarOpen && <span className="font-semibold">Dashboard</span>}
          </a>
          <a href="/create" className={`flex items-center gap-4 w-full py-3 px-3 rounded-xl text-[#87CEFA] bg-[#87CEFA]/10 shadow-lg ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span className="text-xl">✏️</span>
            {sidebarOpen && <span className="font-semibold">Create</span>}
          </a>
          <a href="/calendar" className={`flex items-center gap-4 w-full py-3 px-3 rounded-xl text-gray-600 hover:text-[#87CEFA] hover:bg-[#87CEFA]/10 transition-all ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span className="text-xl">📅</span>
            {sidebarOpen && <span className="font-semibold">Calendar</span>}
          </a>
          <a href="/saved" className={`flex items-center gap-4 w-full py-3 px-3 rounded-xl text-gray-600 hover:text-[#87CEFA] hover:bg-[#87CEFA]/10 transition-all ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span className="text-xl">💾</span>
            {sidebarOpen && <span className="font-semibold">Saved</span>}
          </a>
          <a href="/settings" className={`flex items-center gap-4 w-full py-3 px-3 rounded-xl text-gray-600 hover:text-[#87CEFA] hover:bg-[#87CEFA]/10 transition-all ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
            <span className="text-xl">⚙️</span>
            {sidebarOpen && <span className="font-semibold">Settings</span>}
          </a>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center space-x-8">
            <span className="text-2xl font-bold bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] bg-clip-text text-transparent">PostPal</span>
            <div className="flex space-x-6">
              <a href="/dashboard" className="text-gray-600 hover:text-[#87CEFA] font-medium transition-colors">Dashboard</a>
              <a href="/create" className="text-[#87CEFA] font-bold">Create</a>
              <a href="/calendar" className="text-gray-600 hover:text-[#87CEFA] font-medium transition-colors">Calendar</a>
              <a href="/saved" className="text-gray-600 hover:text-[#87CEFA] font-medium transition-colors">Saved</a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button aria-label="Search" className="text-gray-400 text-xl hover:text-[#87CEFA] transition-colors">🔍</button>
            <button aria-label="Notifications" className="text-gray-400 text-xl hover:text-[#87CEFA] transition-colors">🔔</button>
            <div className="w-10 h-10 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] rounded-full flex items-center justify-center text-white font-bold">U</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Content Creation */}
          <div className="flex-1 flex flex-col p-6 gap-6">
            {/* Header with AI Generator */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Create Amazing Content</h1>
                <p className="text-[#64748B]">Craft engaging posts that connect with your audience</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAIGenerator(true)}
                className="bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <span>🤖</span>
                <span>AI Content Generator</span>
              </motion.button>
            </div>

            {/* Content Type Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
              {["post", "story", "reel", "carousel"].map((type) => (
                <button
                  key={type}
                  onClick={() => setPostData({ ...postData, contentType: type })}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize ${
                    postData.contentType === type
                      ? "bg-white text-[#87CEFA] shadow-md"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Content Creation Area */}
            <div className="flex-1 flex gap-6">
              {/* Left Column - Media & Templates */}
              <div className="w-1/2 flex flex-col gap-6">
                {/* Media Upload */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Media</h3>
                  
                  <FileUploader
                    userId={user.id}
                    onUploadComplete={handleUploadComplete}
                    folder="posts"
                    maxFiles={10}
                    maxSize={50}
                    className="mb-4"
                  />
                  
                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="relative group">
                          {file.contentType.startsWith('image/') && file.thumbnailUrl ? (
                            <Image
                              src={file.thumbnailUrl}
                              alt={file.filename}
                              width={400}
                              height={128}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">
                                {file.contentType.startsWith('video/') ? '🎥' : '📄'}
                              </span>
                            </div>
                          )}
                          <button
                            onClick={() => removeFile(file.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {file.filename}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Templates */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Content Templates</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedTemplate === template.id
                            ? "border-[#87CEFA] bg-[#87CEFA]/5"
                            : "border-gray-200 hover:border-[#87CEFA]/50"
                        }`}
                      >
                        <div className="text-2xl mb-2">{template.icon}</div>
                        <div className="font-semibold text-[#1E293B] text-sm">{template.name}</div>
                        <div className="text-xs text-[#64748B] mt-1">{template.description}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Caption & Settings */}
              <div className="w-1/2 flex flex-col gap-6">
                {/* Caption Editor */}
                <div className="bg-white rounded-2xl p-6 shadow-lg flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1E293B]">Caption</h3>
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <span>{postData.caption.length}/2200</span>
                    </div>
                  </div>
                  
                  <textarea
                    value={postData.caption}
                    onChange={(e) => setPostData({ ...postData, caption: e.target.value })}
                    className="w-full h-48 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-[#87CEFA] focus:ring-2 focus:ring-[#87CEFA]/20 text-[#1E293B]"
                    placeholder="Write your engaging caption here... Use emojis and hashtags to make it more engaging! ✨"
                  />

                  {/* Caption Tools */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="AI suggestions">💡</button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Add hashtags">🏷️</button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Add emojis">😊</button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Add location">📍</button>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Preview">👁️</button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Save template">💾</button>
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Hashtags</h3>
                  <div className="flex flex-wrap gap-2">
                    {postData.hashtags.map((tag, index) => (
                      <span key={index} className="bg-[#87CEFA]/10 text-[#87CEFA] px-3 py-1 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="mt-3 text-[#87CEFA] text-sm font-medium hover:underline">
                    + Add hashtags
                  </button>
                </div>

                {/* Scheduling */}
                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Schedule</h3>
                  <div className="space-y-3">
                    {[
                      { id: "draft", label: "Save as draft", icon: "📝" },
                      { id: "now", label: "Post now", icon: "🚀" },
                      { id: "custom", label: "Custom time", icon: "⏰" },
                      { id: "optimal", label: "Optimal time", icon: "🎯" }
                    ].map((option) => (
                      <label key={option.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="schedule"
                          value={option.id}
                          checked={scheduleType === option.id}
                          onChange={(e) => setScheduleType(e.target.value)}
                          className="text-[#87CEFA] focus:ring-[#87CEFA]"
                        />
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-[#1E293B] font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {scheduleType === "custom" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#87CEFA]"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gray-100 text-[#1E293B] rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Save Draft
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {scheduleType === "now" ? "Post Now" : "Schedule Post"}
              </motion.button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="w-96 bg-white border-l border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-[#1E293B] mb-6">Preview</h3>
            
            {/* Platform Selector */}
            <div className="flex gap-2 mb-6">
              {["Instagram", "Facebook", "Twitter", "LinkedIn"].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setPostData({ ...postData, platform })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    postData.platform === platform
                      ? "bg-[#87CEFA] text-white"
                      : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>

            {/* Preview Card */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              {/* Preview Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] rounded-full flex items-center justify-center text-white font-bold">
                    P
                  </div>
                  <div>
                    <div className="font-semibold text-[#1E293B]">@postpal</div>
                    <div className="text-sm text-[#64748B]">Just now</div>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-4">
                {uploadedFiles.length > 0 ? (
                  <div className="mb-4">
                    {uploadedFiles[0].contentType.startsWith('image/') && uploadedFiles[0].thumbnailUrl ? (
                      <Image
                        src={uploadedFiles[0].thumbnailUrl}
                        alt="Preview"
                        width={600}
                        height={192}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-4xl">
                          {uploadedFiles[0].contentType.startsWith('video/') ? '🎥' : '📄'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-4xl text-gray-400">📷</span>
                  </div>
                )}
                
                <p className="text-[#1E293B] text-sm leading-relaxed">
                  {postData.caption || "Your caption will appear here..."}
                </p>
                
                {postData.hashtags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {postData.hashtags.map((tag, index) => (
                      <span key={index} className="text-[#87CEFA] text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Preview Actions */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[#64748B]">
                <div className="flex gap-4">
                  <button className="flex items-center gap-1 text-sm">
                    <span>❤️</span>
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm">
                    <span>💬</span>
                    <span>Comment</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm">
                    <span>📤</span>
                    <span>Share</span>
                  </button>
                </div>
                <button className="text-sm">
                  <span>🔖</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Content Generator Modal */}
      <AnimatePresence>
        {showAIGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1E293B]">AI Content Generator</h2>
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="text-[#64748B] hover:text-[#1E293B] text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">Content Type</label>
                  <select
                    value={postData.contentType}
                    onChange={(e) => setPostData({ ...postData, contentType: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#87CEFA]"
                  >
                    <option value="post">Post</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel</option>
                    <option value="carousel">Carousel</option>
                  </select>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">Tone</label>
                  <select
                    value={postData.tone}
                    onChange={(e) => setPostData({ ...postData, tone: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#87CEFA]"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                    <option value="humorous">Humorous</option>
                    <option value="inspirational">Inspirational</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-[#1E293B] mb-2">Target Audience</label>
                  <select
                    value={postData.targetAudience}
                    onChange={(e) => setPostData({ ...postData, targetAudience: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#87CEFA]"
                  >
                    <option value="general">General</option>
                    <option value="professionals">Professionals</option>
                    <option value="creators">Creators</option>
                    <option value="businesses">Businesses</option>
                    <option value="students">Students</option>
                  </select>
                </div>

                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={generateAIContent}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating content...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>🤖</span>
                      <span>Generate AI Content</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 