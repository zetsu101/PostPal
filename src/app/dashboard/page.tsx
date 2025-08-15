"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import Skeleton, { MetricSkeleton } from "@/components/ui/Skeleton";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/ui/Button";
import ProtectedRoute from "@/components/ProtectedRoute";

interface AnalyticsData {
  engagementRate: number;
  followersGrowth: number;
  totalImpressions: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  bestPostingTime: string;
  topPerformingPost: string;
  audienceGrowth: number;
}

interface PlatformData {
  platform: string;
  followers: number;
  engagement: number;
  posts: number;
  growth: number;
  color: string;
}

interface PostPerformance {
  id: string;
  title: string;
  platform: string;
  date: string;
  impressions: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    engagementRate: 8.2,
    followersGrowth: 12.5,
    totalImpressions: 124700,
    totalReach: 89200,
    totalLikes: 15600,
    totalComments: 2300,
    totalShares: 890,
    bestPostingTime: "2:00 PM",
    topPerformingPost: "Behind the Scenes: Our Creative Process",
    audienceGrowth: 15.3,
  });

  const [platforms] = useState<PlatformData[]>([
    { platform: "Instagram", followers: 15420, engagement: 8.5, posts: 47, growth: 12.5, color: "from-[#E4405F] to-[#F77737]" },
    { platform: "Facebook", followers: 8920, engagement: 6.2, posts: 32, growth: 8.1, color: "from-[#1877F2] to-[#42A5F5]" },
    { platform: "Twitter", followers: 12340, engagement: 7.8, posts: 89, growth: 15.2, color: "from-[#1DA1F2] to-[#64B5F6]" },
    { platform: "LinkedIn", followers: 5670, engagement: 9.1, posts: 23, growth: 18.7, color: "from-[#0A66C2] to-[#1976D2]" },
  ]);

  const [topPosts, setTopPosts] = useState<PostPerformance[]>([]);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set the data
      setAnalyticsData({
        engagementRate: 8.2,
        followersGrowth: 12.5,
        totalImpressions: 124700,
        totalReach: 89200,
        totalLikes: 15600,
        totalComments: 2300,
        totalShares: 890,
        bestPostingTime: "2:00 PM",
        topPerformingPost: "Behind the Scenes: Our Creative Process",
        audienceGrowth: 15.3,
      });

      setTopPosts([
        {
          id: "1",
          title: "Behind the Scenes: Our Creative Process",
          platform: "Instagram",
          date: "2024-01-15",
          impressions: 15420,
          engagement: 12.5,
          likes: 1890,
          comments: 234,
          shares: 89,
          reach: 12340,
        },
        {
          id: "2",
          title: "Tip Tuesday: Boost Your Engagement",
          platform: "LinkedIn",
          date: "2024-01-14",
          impressions: 8920,
          engagement: 15.2,
          likes: 1340,
          comments: 189,
          shares: 156,
          reach: 7450,
        },
        {
          id: "3",
          title: "Product Launch Announcement",
          platform: "Facebook",
          date: "2024-01-13",
          impressions: 12340,
          engagement: 9.8,
          likes: 1200,
          comments: 167,
          shares: 234,
          reach: 9870,
        },
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Time update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <Container>
          <PageHeader
            title="Dashboard"
            subtitle="Your social media performance at a glance"
            actions={
              <div className="flex gap-3">
                <Skeleton variant="rounded" width="120px" height="40px" />
                <Skeleton variant="rounded" width="100px" height="40px" />
              </div>
            }
          />

          {/* Loading Skeleton */}
          <div className="space-y-8">
            {/* Key Metrics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <MetricSkeleton key={index} />
              ))}
            </div>

            {/* Main Analytics Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Engagement Chart Skeleton */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <Skeleton variant="text" width="200px" height="24px" />
                  <Skeleton variant="rounded" width="120px" height="32px" />
                </div>
                <div className="h-64 flex items-end justify-between gap-2">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <Skeleton variant="rounded" width="100%" height="100%" />
                      <Skeleton variant="text" width="40px" className="mt-2" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats Skeleton */}
              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                    <Skeleton variant="text" width="150px" height="20px" className="mb-4" />
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton variant="text" width="80px" />
                          <Skeleton variant="text" width="60px" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <Skeleton variant="text" width="200px" height="24px" className="mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <Skeleton variant="circular" width="48px" height="48px" />
                    <div className="flex-1">
                      <Skeleton variant="text" width="60%" className="mb-2" />
                      <Skeleton variant="text" width="40%" />
                    </div>
                    <div className="text-right">
                      <Skeleton variant="text" width="60px" className="mb-1" />
                      <Skeleton variant="text" width="80px" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </DashboardLayout>
    );
  }

  // Generate mock chart data
  const generateChartData = (days: number) => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        engagement: Math.floor(Math.random() * 12) + 8, // Higher range for better visibility
        followers: Math.floor(Math.random() * 100) + 50,
        impressions: Math.floor(Math.random() * 5000) + 2000,
      });
    }
    return data;
  };

  const chartData = generateChartData(7);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Container className="py-8">
        <PageHeader
          title="Analytics Dashboard"
          subtitle="Track your performance and optimize your social media strategy"
          actions={(
            <>
              <div className="hidden md:flex gap-2">
                {["7d", "30d", "90d"].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
              <div className="text-right min-w-[120px]">
                <div className="text-sm text-[#6B7280]">Last updated</div>
                <div className="text-lg font-semibold text-[#1F2937]">{currentTime}</div>
              </div>
            </>
          )}
        />

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: "Engagement Rate",
              value: `${analyticsData?.engagementRate || 0}%`,
              change: "+2.1%",
              icon: "📈",
              color: "from-[#34D399] to-[#6EE7B7]",
            },
            {
              label: "Total Impressions",
              value: (analyticsData?.totalImpressions || 0).toLocaleString(),
              change: "+15%",
              icon: "👁️",
              color: "from-[#60A5FA] to-[#93C5FD]",
            },
            {
              label: "Followers Growth",
              value: `${analyticsData?.followersGrowth || 0}%`,
              change: "+5.2%",
              icon: "👥",
              color: "from-[#FACC15] to-[#FDE047]",
            },
            {
              label: "Total Reach",
              value: (analyticsData?.totalReach || 0).toLocaleString(),
              change: "+12%",
              icon: "📡",
              color: "from-[#A78BFA] to-[#C4B5FD]",
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}>
                  <span className="text-xl">{metric.icon}</span>
                </div>
                <span className="text-sm text-[#34D399] font-semibold">{metric.change}</span>
              </div>
              <div className="text-2xl font-bold text-[#1F2937] mb-1">{metric.value}</div>
              <div className="text-sm text-[#6B7280]">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Engagement Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#1F2937]">Engagement Over Time</h3>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#87CEFA]"
              >
                <option value="all">All Platforms</option>
                {platforms.map((platform) => (
                  <option key={platform.platform} value={platform.platform.toLowerCase()}>
                    {platform.platform}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Chart Visualization */}
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative h-full">
                    <div
                      className="bg-gradient-to-t from-[#87CEFA] to-[#40E0D0] rounded-t-lg transition-all duration-300"
                      style={{ height: `${Math.max((data.engagement / 15) * 100, 15)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-[#6B7280] mt-2 text-center">{data.date}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-[#6B7280]">
              <span>Average: 8.2%</span>
              <span>Peak: 15.3%</span>
            </div>
          </motion.div>

          {/* Platform Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-[#1F2937] mb-6">Platform Performance</h3>
            <div className="space-y-4">
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.platform}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4 rounded-xl border border-gray-100 hover:border-[#87CEFA]/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${platform.color} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">
                          {platform.platform.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-[#1F2937]">{platform.platform}</div>
                        <div className="text-sm text-[#6B7280]">{platform.followers.toLocaleString()} followers</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1F2937]">{platform.engagement}%</div>
                      <div className="text-xs text-[#34D399]">+{platform.growth}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${platform.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(platform.engagement / 10) * 100}%` }}
                    ></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performing Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-[#1F2937] mb-6">Top Performing Posts</h3>
                         <div className="space-y-4">
               {topPosts.map((post) => (
                <div key={post.id} className="p-4 rounded-xl border border-gray-100 hover:border-[#87CEFA]/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-[#1F2937] text-sm mb-1">{post.title}</div>
                      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                        <span>{post.platform}</span>
                        <span>•</span>
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1F2937]">{post.engagement}%</div>
                      <div className="text-xs text-[#34D399]">engagement</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-semibold text-[#1F2937]">{post.impressions.toLocaleString()}</div>
                      <div className="text-[#6B7280]">Impressions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[#1F2937]">{post.likes.toLocaleString()}</div>
                      <div className="text-[#6B7280]">Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[#1F2937]">{post.comments}</div>
                      <div className="text-[#6B7280]">Comments</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-[#1F2937]">{post.shares}</div>
                      <div className="text-[#6B7280]">Shares</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Audience Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-[#1F2937] mb-6">Audience Insights</h3>
            <div className="space-y-6">
              {/* Best Posting Time */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#87CEFA]/10 to-[#40E0D0]/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#87CEFA] rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">⏰</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F2937]">Best Posting Time</div>
                    <div className="text-sm text-[#6B7280]">When your audience is most active</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#87CEFA]">{analyticsData?.bestPostingTime || '2:00 PM'}</div>
                <div className="text-sm text-[#6B7280]">Best Posting Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#34D399]">+{analyticsData?.audienceGrowth || 15.3}%</div>
                <div className="text-sm text-[#6B7280]">Audience Growth</div>
              </div>
            </div>
          </motion.div>

          {/* Engagement Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-[#1F2937] mb-6">Engagement Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#87CEFA] rounded-full"></div>
                  <span className="text-sm text-[#6B7280]">Likes</span>
                </div>
                <span className="font-semibold text-[#1F2937]">{(analyticsData?.totalLikes || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
                  <span className="text-sm text-[#6B7280]">Comments</span>
                </div>
                <span className="font-semibold text-[#1F2937]">{(analyticsData?.totalComments || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-[#F59E0B] rounded-full"></div>
                  <span className="text-sm text-[#6B7280]">Shares</span>
                </div>
                <span className="font-semibold text-[#1F2937]">{(analyticsData?.totalShares || 0).toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-[#1F2937] mb-6">AI-Powered Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <div className="font-semibold text-[#1F2937]">Post More Videos</div>
              </div>
              <p className="text-sm text-[#6B7280] mb-3">
                Video content gets 2.5x more engagement than static posts. Try creating more reels and stories.
              </p>
              <button className="text-[#87CEFA] text-sm font-medium hover:underline">
                Create Video Content →
              </button>
            </div>

            <div className="p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#34D399] to-[#6EE7B7] rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">⏰</span>
                </div>
                <div className="font-semibold text-[#1F2937]">Optimize Timing</div>
              </div>
              <p className="text-sm text-[#6B7280] mb-3">
                Your audience is most active at 2:00 PM. Schedule more posts during this time for better reach.
              </p>
              <button className="text-[#34D399] text-sm font-medium hover:underline">
                Schedule Posts →
              </button>
            </div>

            <div className="p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FACC15] to-[#FDE047] rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">🏷️</span>
                </div>
                <div className="font-semibold text-[#1F2937]">Use Trending Hashtags</div>
              </div>
              <p className="text-sm text-[#6B7280] mb-3">
                Add trending hashtags to increase discoverability. Your posts with hashtags get 12% more reach.
              </p>
              <button className="text-[#FACC15] text-sm font-medium hover:underline">
                Find Hashtags →
              </button>
            </div>
          </div>
        </motion.div>
      </Container>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 