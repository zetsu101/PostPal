"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Competitor {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: number;
  engagement: number;
  posts: number;
  growth: number;
  bestContent: string;
  topHashtags: string[];
  postingFrequency: number;
  industry: string;
  performance: {
    engagementRate: number;
    reachRate: number;
    growthRate: number;
    consistency: number;
  };
}

interface BenchmarkData {
  industry: string;
  avgEngagement: number;
  avgGrowth: number;
  avgPostingFrequency: number;
  topPerformers: Competitor[];
}

export default function CompetitorAnalysis() {
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [viewMode, setViewMode] = useState("overview");

  const competitors: Competitor[] = [
    {
      id: "1",
      name: "TechFlow",
      handle: "@techflow",
      avatar: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&h=100&fit=crop&crop=face",
      followers: 125000,
      engagement: 8500,
      posts: 342,
      growth: 12.5,
      bestContent: "Video tutorials",
      topHashtags: ["#tech", "#tutorial", "#coding"],
      postingFrequency: 2.1,
      industry: "technology",
      performance: {
        engagementRate: 6.8,
        reachRate: 15.2,
        growthRate: 12.5,
        consistency: 85
      }
    },
    {
      id: "2",
      name: "CreativeStudio",
      handle: "@creativestudio",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      followers: 89000,
      engagement: 7200,
      posts: 289,
      growth: 8.9,
      bestContent: "Behind-the-scenes",
      topHashtags: ["#creative", "#design", "#art"],
      postingFrequency: 1.8,
      industry: "creative",
      performance: {
        engagementRate: 8.1,
        reachRate: 12.8,
        growthRate: 8.9,
        consistency: 92
      }
    },
    {
      id: "3",
      name: "FitnessPro",
      handle: "@fitnesspro",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      followers: 156000,
      engagement: 12400,
      posts: 456,
      growth: 15.2,
      bestContent: "Workout videos",
      topHashtags: ["#fitness", "#workout", "#health"],
      postingFrequency: 2.5,
      industry: "fitness",
      performance: {
        engagementRate: 7.9,
        reachRate: 18.5,
        growthRate: 15.2,
        consistency: 88
      }
    },
    {
      id: "4",
      name: "FoodieDelight",
      handle: "@foodiedelight",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      followers: 98000,
      engagement: 8900,
      posts: 312,
      growth: 10.8,
      bestContent: "Recipe videos",
      topHashtags: ["#food", "#recipe", "#cooking"],
      postingFrequency: 1.9,
      industry: "food",
      performance: {
        engagementRate: 9.1,
        reachRate: 14.2,
        growthRate: 10.8,
        consistency: 90
      }
    }
  ];

  const benchmarks: BenchmarkData[] = [
    {
      industry: "technology",
      avgEngagement: 5.2,
      avgGrowth: 8.5,
      avgPostingFrequency: 1.8,
      topPerformers: competitors.filter(c => c.industry === "technology")
    },
    {
      industry: "creative",
      avgEngagement: 7.8,
      avgGrowth: 9.2,
      avgPostingFrequency: 2.1,
      topPerformers: competitors.filter(c => c.industry === "creative")
    },
    {
      industry: "fitness",
      avgEngagement: 6.9,
      avgGrowth: 12.1,
      avgPostingFrequency: 2.3,
      topPerformers: competitors.filter(c => c.industry === "fitness")
    },
    {
      industry: "food",
      avgEngagement: 8.5,
      avgGrowth: 11.3,
      avgPostingFrequency: 2.0,
      topPerformers: competitors.filter(c => c.industry === "food")
    }
  ];

  const filteredCompetitors = selectedIndustry === "all" 
    ? competitors 
    : competitors.filter(c => c.industry === selectedIndustry);

  const currentBenchmark = benchmarks.find(b => b.industry === selectedIndustry) || benchmarks[0];

  const getPerformanceColor = (value: number, benchmark: number) => {
    const ratio = value / benchmark;
    if (ratio >= 1.2) return "text-[#10B981]";
    if (ratio >= 0.8) return "text-[#F59E0B]";
    return "text-[#EF4444]";
  };

  const getPerformanceIcon = (value: number, benchmark: number) => {
    const ratio = value / benchmark;
    if (ratio >= 1.2) return "📈";
    if (ratio >= 0.8) return "➡️";
    return "📉";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Competitor Analysis</h2>
          <p className="text-[#6B7280]">Benchmark your performance against industry leaders</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-[#1F2937]"
          >
            <option value="all">All Industries</option>
            <option value="technology">Technology</option>
            <option value="creative">Creative</option>
            <option value="fitness">Fitness</option>
            <option value="food">Food</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "benchmarks", label: "Benchmarks", icon: "📈" },
          { id: "strategies", label: "Strategies", icon: "💡" },
          { id: "trends", label: "Trends", icon: "📈" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === tab.id
                ? "bg-white text-[#87CEFA] shadow-md"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Based on View Mode */}
      <AnimatePresence mode="wait">
        {viewMode === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Competitor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitors.map((competitor) => (
                <motion.div
                  key={competitor.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:border-[#87CEFA]/50 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={competitor.avatar}
                      alt={competitor.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-[#1F2937]">{competitor.name}</div>
                      <div className="text-sm text-[#6B7280]">{competitor.handle}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Followers:</span>
                      <span className="font-medium">{competitor.followers.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Engagement Rate:</span>
                      <span className={`font-medium ${getPerformanceColor(competitor.performance.engagementRate, currentBenchmark.avgEngagement)}`}>
                        {getPerformanceIcon(competitor.performance.engagementRate, currentBenchmark.avgEngagement)} {competitor.performance.engagementRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Growth:</span>
                      <span className={`font-medium ${getPerformanceColor(competitor.growth, currentBenchmark.avgGrowth)}`}>
                        {getPerformanceIcon(competitor.growth, currentBenchmark.avgGrowth)} +{competitor.growth.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Posts:</span>
                      <span className="font-medium">{competitor.posts}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-[#6B7280] mb-2">Best Content: {competitor.bestContent}</div>
                    <div className="flex flex-wrap gap-1">
                      {competitor.topHashtags.map((hashtag) => (
                        <span
                          key={hashtag}
                          className="px-2 py-1 bg-[#87CEFA]/10 text-[#87CEFA] rounded text-xs font-medium"
                        >
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Industry Benchmarks */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Industry Benchmarks</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#87CEFA]">{currentBenchmark.avgEngagement.toFixed(1)}%</div>
                  <div className="text-sm text-[#6B7280]">Avg. Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#40E0D0]">{currentBenchmark.avgGrowth.toFixed(1)}%</div>
                  <div className="text-sm text-[#6B7280]">Avg. Growth Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F59E0B]">{currentBenchmark.avgPostingFrequency.toFixed(1)}</div>
                  <div className="text-sm text-[#6B7280]">Avg. Posts/Day</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#10B981]">{filteredCompetitors.length}</div>
                  <div className="text-sm text-[#6B7280]">Competitors Analyzed</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === "benchmarks" && (
          <motion.div
            key="benchmarks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Detailed Benchmarks */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Performance Benchmarks</h3>
              <div className="space-y-4">
                {benchmarks.map((benchmark) => (
                  <div key={benchmark.industry} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-[#1F2937] capitalize">{benchmark.industry}</h4>
                      <span className="text-sm text-[#6B7280]">{benchmark.topPerformers.length} competitors</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#87CEFA]">{benchmark.avgEngagement.toFixed(1)}%</div>
                        <div className="text-xs text-[#6B7280]">Engagement Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#40E0D0]">{benchmark.avgGrowth.toFixed(1)}%</div>
                        <div className="text-xs text-[#6B7280]">Growth Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#F59E0B]">{benchmark.avgPostingFrequency.toFixed(1)}</div>
                        <div className="text-xs text-[#6B7280]">Posts/Day</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === "strategies" && (
          <motion.div
            key="strategies"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Strategy Insights */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Competitor Strategies</h3>
              <div className="space-y-4">
                {filteredCompetitors.map((competitor) => (
                  <div key={competitor.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Image
                        src={competitor.avatar}
                        alt={competitor.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-[#1F2937]">{competitor.name}</div>
                        <div className="text-sm text-[#6B7280]">Strategy Analysis</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-[#1F2937] mb-2">Content Strategy</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#6B7280]">Best Content Type:</span>
                            <span className="font-medium">{competitor.bestContent}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B7280]">Posting Frequency:</span>
                            <span className="font-medium">{competitor.postingFrequency} posts/day</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#6B7280]">Consistency Score:</span>
                            <span className="font-medium">{competitor.performance.consistency}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-[#1F2937] mb-2">Hashtag Strategy</h5>
                        <div className="flex flex-wrap gap-1">
                          {competitor.topHashtags.map((hashtag) => (
                            <span
                              key={hashtag}
                              className="px-2 py-1 bg-[#87CEFA]/10 text-[#87CEFA] rounded text-xs font-medium"
                            >
                              {hashtag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === "trends" && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Trend Analysis */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Industry Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-[#1F2937] mb-3">Top Performing Content Types</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6B7280]">Video Content</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-[#87CEFA] h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6B7280]">Story Content</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-[#40E0D0] h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6B7280]">Carousel Posts</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-[#F59E0B] h-2 rounded-full" style={{ width: '68%' }}></div>
                        </div>
                        <span className="text-sm font-medium">68%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-[#1F2937] mb-3">Optimal Posting Times</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Peak Hours:</span>
                      <span className="font-medium">2:00 PM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Best Days:</span>
                      <span className="font-medium">Tuesday, Wednesday</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B7280]">Engagement Peak:</span>
                      <span className="font-medium">Wednesday 3:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 