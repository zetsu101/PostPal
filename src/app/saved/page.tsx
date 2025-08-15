"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: "available" | "premium" | "coming-soon";
  features: string[];
}

interface GeneratedContent {
  id: string;
  type: "image" | "hashtags" | "caption" | "prediction";
  title: string;
  content: string;
  platform: string;
  createdAt: string;
  status: "generated" | "processing" | "failed";
}

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState("ai-tools");
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);

  const aiTools: AITool[] = [
    {
      id: "image-generation",
      name: "AI Image Generation",
      description: "Create stunning visuals for your posts using AI",
      icon: "🎨",
      color: "from-[#FF6B6B] to-[#FF8E8E]",
      status: "premium",
      features: [
        "Generate custom images from text prompts",
        "Multiple style options (realistic, artistic, minimalist)",
        "Brand-consistent color schemes",
        "High-resolution outputs",
        "Quick generation (30 seconds)"
      ]
    },
    {
      id: "hashtag-optimization",
      name: "Hashtag Optimization",
      description: "Find trending and relevant hashtags for maximum reach",
      icon: "🏷️",
      color: "from-[#4ECDC4] to-[#44A08D]",
      status: "available",
      features: [
        "Trending hashtag suggestions",
        "Industry-specific recommendations",
        "Engagement rate analysis",
        "Competitor hashtag research",
        "Optimal hashtag count per platform"
      ]
    },
    {
      id: "content-prediction",
      name: "Content Performance Prediction",
      description: "Predict how your posts will perform before publishing",
      icon: "🔮",
      color: "from-[#A8E6CF] to-[#7FCDCD]",
      status: "premium",
      features: [
        "Engagement rate predictions",
        "Best posting time recommendations",
        "Content type optimization",
        "Audience response forecasting",
        "ROI estimation"
      ]
    },
    {
      id: "caption-generator",
      name: "AI Caption Generator",
      description: "Create engaging captions that drive engagement",
      icon: "✍️",
      color: "from-[#FFD93D] to-[#FF6B6B]",
      status: "available",
      features: [
        "Multiple tone options (professional, casual, humorous)",
        "Platform-specific optimization",
        "Call-to-action suggestions",
        "Emoji recommendations",
        "Character count optimization"
      ]
    },
    {
      id: "audience-analysis",
      name: "Audience Analysis AI",
      description: "Deep insights into your audience behavior and preferences",
      icon: "👥",
      color: "from-[#6C5CE7] to-[#A29BFE]",
      status: "premium",
      features: [
        "Demographic analysis",
        "Behavioral patterns",
        "Content preference insights",
        "Engagement timing analysis",
        "Growth opportunity identification"
      ]
    },
    {
      id: "content-calendar-ai",
      name: "Smart Content Calendar",
      description: "AI-powered content planning and scheduling",
      icon: "📅",
      color: "from-[#FD79A8] to-[#FDCB6E]",
      status: "coming-soon",
      features: [
        "Optimal posting schedule",
        "Content mix recommendations",
        "Seasonal trend integration",
        "Competitor analysis",
        "Automated content planning"
      ]
    }
  ];

  const handleGenerateContent = async (toolId: string) => {
    setIsGenerating(true);
    setSelectedTool(toolId);
    
    // Simulate AI generation
    setTimeout(() => {
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        type: toolId.includes("image") ? "image" : toolId.includes("hashtag") ? "hashtags" : "caption",
        title: `Generated ${aiTools.find(t => t.id === toolId)?.name}`,
        content: generateMockContent(toolId),
        platform: "Instagram",
        createdAt: new Date().toISOString(),
        status: "generated"
      };
      
      setGeneratedContent(prev => [newContent, ...prev]);
      setIsGenerating(false);
      setSelectedTool(null);
    }, 3000);
  };

  const generateMockContent = (toolId: string): string => {
    switch (toolId) {
      case "image-generation":
        return "A modern workspace with a laptop showing social media analytics, surrounded by creative elements like colorful sticky notes, a coffee cup, and natural lighting";
      case "hashtag-optimization":
        return "#SocialMediaMarketing #DigitalMarketing #ContentCreation #MarketingTips #BusinessGrowth #SocialMediaStrategy #Marketing #Entrepreneur #SmallBusiness #Branding";
      case "caption-generator":
        return "🚀 Ready to transform your social media game? Our latest insights show that consistent posting can increase engagement by up to 40%! 💡\n\nWhat's your biggest social media challenge? Drop it below! 👇\n\n#SocialMediaTips #GrowthHacking #DigitalMarketing";
      case "content-prediction":
        return "Predicted Engagement Rate: 8.5%\nEstimated Reach: 12,400\nBest Posting Time: 2:00 PM\nRecommended Hashtags: 5-7\nContent Type: Video (2.5x more engagement)";
      default:
        return "AI-generated content based on your brand profile and current trends";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="bg-[#34D399] text-white px-2 py-1 rounded-full text-xs font-medium">Available</span>;
      case "premium":
        return <span className="bg-[#F59E0B] text-white px-2 py-1 rounded-full text-xs font-medium">Premium</span>;
      case "coming-soon":
        return <span className="bg-[#6B7280] text-white px-2 py-1 rounded-full text-xs font-medium">Coming Soon</span>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <Container className="py-8">
        <PageHeader
          title="AI-Powered Features"
          subtitle="Leverage AI to create, optimize, and predict your social success"
        />

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8"
        >
          {[
            { id: "ai-tools", label: "AI Tools", icon: "🤖" },
            { id: "generated", label: "Generated Content", icon: "✨" },
            { id: "insights", label: "AI Insights", icon: "📊" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#64748B] shadow-md"
                  : "text-[#6B7280] hover:text-[#1F2937]"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content Based on Active Tab */}
        <AnimatePresence mode="wait">
          {activeTab === "ai-tools" && (
            <motion.div
              key="ai-tools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* AI Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiTools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:border-[#C7D2FE]/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center`}>
                        <span className="text-white text-2xl">{tool.icon}</span>
                      </div>
                      {getStatusBadge(tool.status)}
                    </div>

                    <h3 className="text-xl font-bold text-[#1F2937] mb-2">{tool.name}</h3>
                    <p className="text-[#6B7280] mb-4">{tool.description}</p>

                    <div className="space-y-2 mb-6">
                      {tool.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <span className="text-[#34D399]">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleGenerateContent(tool.id)}
                      disabled={tool.status === "coming-soon" || isGenerating}
                      className={`w-full py-3 rounded-xl font-semibold transition-all ${
                        tool.status === "coming-soon"
                          ? "bg-gray-100 text-[#6B7280] cursor-not-allowed"
                          : isGenerating && selectedTool === tool.id
                          ? "bg-[#C7D2FE] text-[#1F2937]"
                          : "bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] text-[#1F2937] hover:shadow-lg"
                      }`}
                    >
                      {tool.status === "coming-soon" ? (
                        "Coming Soon"
                      ) : isGenerating && selectedTool === tool.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Generating...</span>
                        </div>
                      ) : (
                        `Use ${tool.name}`
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* AI Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🎨</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1F2937]">156</div>
                      <div className="text-sm text-[#6B7280]">Images Generated</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#34D399] to-[#6EE7B7] rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🏷️</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1F2937]">2,340</div>
                      <div className="text-sm text-[#6B7280]">Hashtags Suggested</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#FACC15] to-[#FDE047] rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">✍️</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1F2937]">89</div>
                      <div className="text-sm text-[#6B7280]">Captions Created</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#A78BFA] to-[#C4B5FD] rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🔮</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#1F2937]">94%</div>
                      <div className="text-sm text-[#6B7280]">Prediction Accuracy</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "generated" && (
            <motion.div
              key="generated"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">Generated Content</h2>
                
                {generatedContent.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">✨</span>
                    <h3 className="text-xl font-semibold text-[#1F2937] mb-2">No Generated Content Yet</h3>
                    <p className="text-[#6B7280] mb-6">Start using AI tools to create amazing content</p>
                    <button
                      onClick={() => setActiveTab("ai-tools")}
                      className="bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] text-[#1F2937] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Explore AI Tools
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedContent.map((content) => (
                      <div key={content.id} className="p-6 border border-gray-200 rounded-xl hover:border-[#C7D2FE]/50 transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-[#1F2937] mb-1">{content.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                              <span>{content.platform}</span>
                              <span>•</span>
                              <span>{new Date(content.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              content.status === "generated" ? "bg-[#34D399]" : 
                              content.status === "processing" ? "bg-[#F59E0B]" : "bg-[#EF4444]"
                            }`}></span>
                            <span className="text-sm text-[#6B7280] capitalize">{content.status}</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <p className="text-[#1F2937] whitespace-pre-wrap">{content.content}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-[#C7D2FE] text-[#1F2937] rounded-lg text-sm font-medium hover:bg-[#A5B4FC] transition-colors">
                            Use Content
                          </button>
                          <button className="px-4 py-2 bg-gray-100 text-[#1F2937] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                            Regenerate
                          </button>
                          <button className="px-4 py-2 bg-gray-100 text-[#1F2937] rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                            Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">AI Insights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="font-semibold text-[#1F2937] mb-4">Content Performance Insights</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Best performing content type</span>
                        <span className="font-semibold text-[#1F2937]">Video Posts</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Optimal posting frequency</span>
                        <span className="font-semibold text-[#1F2937]">3-4 times per week</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Peak engagement time</span>
                        <span className="font-semibold text-[#1F2937]">2:00 PM - 4:00 PM</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 border border-gray-200 rounded-xl">
                    <h3 className="font-semibold text-[#1F2937] mb-4">Audience Insights</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Primary audience age</span>
                        <span className="font-semibold text-[#1F2937]">25-34 years</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Top interests</span>
                        <span className="font-semibold text-[#1F2937]">Technology, Business</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Engagement rate trend</span>
                        <span className="font-semibold text-[#34D399]">+12% this month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </DashboardLayout>
  );
} 