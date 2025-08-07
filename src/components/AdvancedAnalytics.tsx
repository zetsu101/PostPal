"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { analyticsEngine, type AnalyticsData, type ReportData, type Insight, type Recommendation } from "@/lib/analytics";
import CompetitorAnalysis from "./CompetitorAnalysis";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

export default function AdvancedAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");
  const [selectedPlatforms, setSelectedPlatforms] = useState(["instagram", "facebook", "twitter"]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() },
    platforms: selectedPlatforms,
    metrics: ["engagement", "reach", "growth"],
    includeCharts: true,
    includeInsights: true,
    format: "pdf" as const
  });

  useEffect(() => {
    loadAnalytics();
    loadReports();
  }, [dateRange, selectedPlatforms]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      
      switch (dateRange) {
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "1y":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const data = await analyticsEngine.generateAnalytics(
        { start: startDate.toISOString(), end: endDate.toISOString() },
        selectedPlatforms
      );
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = () => {
    setReports(analyticsEngine.getReports());
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const report = await analyticsEngine.generateReport(reportConfig);
      setReports(analyticsEngine.getReports());
      setShowReportModal(false);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (reportId: string, format: 'pdf' | 'csv' | 'json') => {
    try {
      const data = await analyticsEngine.exportReport(reportId, format);
      
      // Create download link
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export report:", error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive": return "📈";
      case "negative": return "📉";
      case "opportunity": return "💡";
      default: return "📊";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "positive": return "text-[#10B981]";
      case "negative": return "text-[#EF4444]";
      case "opportunity": return "text-[#F59E0B]";
      default: return "text-[#6B7280]";
    }
  };

  const getRecommendationPriority = (priority: string) => {
    switch (priority) {
      case "high": return "bg-[#EF4444] text-white";
      case "medium": return "bg-[#F59E0B] text-white";
      case "low": return "bg-[#10B981] text-white";
      default: return "bg-[#6B7280] text-white";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#87CEFA] mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Advanced Analytics</h2>
          <p className="text-[#6B7280]">Comprehensive insights and reporting for your social media performance</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-[#1F2937]"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            📊 Generate Report
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
        {[
          { id: "overview", label: "Overview", icon: "📊" },
          { id: "performance", label: "Performance", icon: "📈" },
          { id: "audience", label: "Audience", icon: "👥" },
          { id: "content", label: "Content", icon: "📝" },
          { id: "competitors", label: "Competitors", icon: "🏆" },
          { id: "reports", label: "Reports", icon: "📋" },
          { id: "insights", label: "Insights", icon: "💡" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#87CEFA] shadow-md"
                : "text-[#6B7280] hover:text-[#1F2937]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Based on Active Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && analyticsData && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">📊</div>
                  <div className="text-sm text-[#10B981] font-medium">+12.5%</div>
                </div>
                <div className="text-2xl font-bold text-[#1F2937]">{analyticsData.totalEngagement.toLocaleString()}</div>
                <div className="text-sm text-[#6B7280]">Total Engagement</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">👥</div>
                  <div className="text-sm text-[#10B981] font-medium">+{analyticsData.followersGrowth.toFixed(1)}%</div>
                </div>
                <div className="text-2xl font-bold text-[#1F2937]">{analyticsData.totalImpressions.toLocaleString()}</div>
                <div className="text-sm text-[#6B7280]">Total Impressions</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">📈</div>
                  <div className="text-sm text-[#10B981] font-medium">+{analyticsData.engagementGrowth.toFixed(1)}%</div>
                </div>
                <div className="text-2xl font-bold text-[#1F2937]">{analyticsData.engagementRate.toFixed(1)}%</div>
                <div className="text-sm text-[#6B7280]">Engagement Rate</div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl">💰</div>
                  <div className="text-sm text-[#10B981] font-medium">+{analyticsData.returnOnInvestment.toFixed(0)}%</div>
                </div>
                <div className="text-2xl font-bold text-[#1F2937]">${analyticsData.returnOnInvestment.toFixed(0)}</div>
                <div className="text-sm text-[#6B7280]">ROI</div>
              </div>
            </div>

            {/* Platform Performance */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Platform Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.platformBreakdown.map((platform) => (
                  <div key={platform.platform} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-[#1F2937] capitalize">{platform.platform}</div>
                      <div className="text-sm text-[#10B981] font-medium">+{platform.growth.toFixed(1)}%</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Followers:</span>
                        <span className="font-medium">{platform.followers.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Engagement:</span>
                        <span className="font-medium">{platform.engagementRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Posts:</span>
                        <span className="font-medium">{platform.posts}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "performance" && analyticsData && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Top Performing Posts */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Top Performing Posts</h3>
              <div className="space-y-4">
                {analyticsData.topPerformingPosts.map((post, index) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#87CEFA] rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-[#1F2937]">{post.title}</div>
                          <div className="text-sm text-[#6B7280] capitalize">{post.platform} • {post.contentType}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#10B981]">{post.engagementRate.toFixed(1)}%</div>
                        <div className="text-sm text-[#6B7280]">Engagement Rate</div>
                      </div>
                    </div>
                    <div className="text-sm text-[#6B7280] mb-3">{post.content}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>❤️ {post.engagement.likes.toLocaleString()}</span>
                      <span>💬 {post.engagement.comments.toLocaleString()}</span>
                      <span>🔄 {post.engagement.shares.toLocaleString()}</span>
                      <span>👁️ {post.engagement.impressions.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Posting Times */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Best Posting Times</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.bestPostingTimes.slice(0, 6).map((time, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#87CEFA]">{time.hour}:00</div>
                      <div className="text-sm text-[#6B7280]">{time.day}</div>
                      <div className="text-lg font-semibold text-[#10B981] mt-2">{time.engagementRate.toFixed(1)}%</div>
                      <div className="text-xs text-[#6B7280]">Engagement Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "audience" && analyticsData && (
          <motion.div
            key="audience"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Age Distribution</h3>
                <div className="space-y-3">
                  {analyticsData.audienceDemographics.ageGroups.map((age) => (
                    <div key={age.age} className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">{age.age}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#87CEFA] h-2 rounded-full"
                            style={{ width: `${age.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{age.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Top Locations</h3>
                <div className="space-y-3">
                  {analyticsData.audienceDemographics.locations.map((location) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">{location.location}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#40E0D0] h-2 rounded-full"
                            style={{ width: `${location.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{location.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Behavior Analysis */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Audience Behavior</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#87CEFA]">{analyticsData.audienceBehavior.sessionDuration.toFixed(0)}s</div>
                  <div className="text-sm text-[#6B7280]">Avg. Session Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F59E0B]">{analyticsData.audienceBehavior.bounceRate.toFixed(1)}%</div>
                  <div className="text-sm text-[#6B7280]">Bounce Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#10B981]">{analyticsData.audienceGrowth.growthRate.toFixed(1)}%</div>
                  <div className="text-sm text-[#6B7280]">Growth Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#40E0D0]">{analyticsData.audienceGrowth.retentionRate.toFixed(1)}%</div>
                  <div className="text-sm text-[#6B7280]">Retention Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "content" && analyticsData && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Content Type Performance */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Content Type Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analyticsData.bestContentTypes.map((contentType) => (
                  <div key={contentType.type} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-[#87CEFA]">{contentType.type}</div>
                      <div className="text-sm text-[#6B7280]">{contentType.count} posts</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Avg. Engagement:</span>
                        <span className="font-medium">{contentType.averageEngagement.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Engagement Rate:</span>
                        <span className="font-medium">{contentType.engagementRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Avg. Reach:</span>
                        <span className="font-medium">{contentType.averageReach.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "competitors" && (
          <motion.div
            key="competitors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <CompetitorAnalysis />
          </motion.div>
        )}

        {activeTab === "reports" && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Reports List */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1F2937]">Generated Reports</h3>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors"
                >
                  + New Report
                </button>
              </div>
              
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-[#6B7280]">No reports generated yet</p>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="mt-4 px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors"
                  >
                    Generate Your First Report
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-[#1F2937]">{report.title}</div>
                          <div className="text-sm text-[#6B7280]">
                            Generated: {new Date(report.generatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => exportReport(report.id, 'pdf')}
                            className="px-3 py-1 bg-[#EF4444] text-white rounded text-sm hover:bg-[#DC2626] transition-colors"
                          >
                            PDF
                          </button>
                          <button
                            onClick={() => exportReport(report.id, 'csv')}
                            className="px-3 py-1 bg-[#10B981] text-white rounded text-sm hover:bg-[#059669] transition-colors"
                          >
                            CSV
                          </button>
                          <button
                            onClick={() => exportReport(report.id, 'json')}
                            className="px-3 py-1 bg-[#6B7280] text-white rounded text-sm hover:bg-[#4B5563] transition-colors"
                          >
                            JSON
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-[#6B7280]">
                        Platforms: {report.config.platforms.join(', ')} • 
                        Metrics: {report.config.metrics.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "insights" && analyticsData && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* AI Insights */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">AI-Powered Insights</h3>
              <div className="space-y-4">
                {analyticsEngine.generateInsights(analyticsData).map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-[#1F2937]">{insight.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getInsightColor(insight.type)}`}>
                            {insight.impact} impact
                          </span>
                        </div>
                        <p className="text-sm text-[#6B7280] mb-2">{insight.description}</p>
                        {insight.recommendation && (
                          <div className="text-sm text-[#87CEFA] font-medium">
                            💡 {insight.recommendation}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#10B981]">+{insight.change.toFixed(1)}%</div>
                        <div className="text-sm text-[#6B7280]">Change</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Strategic Recommendations</h3>
              <div className="space-y-4">
                {analyticsEngine.generateRecommendations(analyticsData, []).map((rec) => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-[#1F2937]">{rec.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getRecommendationPriority(rec.priority)}`}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-[#6B7280]">{rec.description}</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-[#6B7280]">Effort: {rec.effort}</div>
                        <div className="text-[#6B7280]">Impact: {rec.expectedImpact}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {rec.actionItems.map((item, index) => (
                        <div key={index} className="text-sm text-[#6B7280] flex items-center gap-2">
                          <span>•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Generation Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Generate Report</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">Format</label>
                  <select
                    value={reportConfig.format}
                    onChange={(e) => setReportConfig({...reportConfig, format: e.target.value as 'pdf' | 'csv' | 'json'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-[#6B7280] rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={generateReport}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-[#87CEFA] text-white rounded-lg font-medium hover:bg-[#5F9EC7] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Generating...' : 'Generate Report'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 