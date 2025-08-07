"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  platform: string;
  scheduledDate: Date;
  status: "draft" | "scheduled" | "published";
  contentType: string;
  imagePrompt?: string;
  hashtags: string[];
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  posts: ScheduledPost[];
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [showAddPost, setShowAddPost] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  // Mock scheduled posts
  const [scheduledPosts] = useState<ScheduledPost[]>([
    {
      id: "1",
      title: "Product Launch Announcement",
      caption: "Excited to announce our latest feature! 🚀",
      platform: "Instagram",
      scheduledDate: new Date(2024, 11, 15, 10, 0),
      status: "scheduled",
      contentType: "Product",
      hashtags: ["#launch", "#newfeature", "#excited"]
    },
    {
      id: "2", 
      title: "Behind the Scenes",
      caption: "A day in the life of our team! 👥",
      platform: "LinkedIn",
      scheduledDate: new Date(2024, 11, 18, 14, 30),
      status: "draft",
      contentType: "Behind the Scenes",
      hashtags: ["#team", "#culture", "#worklife"]
    },
    {
      id: "3",
      title: "Customer Success Story",
      caption: "How Sarah increased her engagement by 300%! 📈",
      platform: "Twitter",
      scheduledDate: new Date(2024, 11, 20, 9, 0),
      status: "scheduled",
      contentType: "Testimonial",
      hashtags: ["#success", "#growth", "#testimonial"]
    }
  ]);

  // Generate calendar days
  useEffect(() => {
    const days: CalendarDay[] = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    
    // Get first day of calendar (including previous month's days)
    const firstCalendarDay = new Date(firstDay);
    firstCalendarDay.setDate(firstDay.getDate() - firstDay.getDay());
    
    // Generate all calendar days
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstCalendarDay);
      date.setDate(firstCalendarDay.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      
      // Find posts for this date
      const posts = scheduledPosts.filter(post => 
        post.scheduledDate.toDateString() === date.toDateString()
      );
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        posts
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, scheduledPosts]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram": return "bg-gradient-to-r from-[#E4405F] to-[#C13584]";
      case "linkedin": return "bg-gradient-to-r from-[#0077B5] to-[#00A0DC]";
      case "twitter": return "bg-gradient-to-r from-[#1DA1F2] to-[#0D8BD9]";
      case "facebook": return "bg-gradient-to-r from-[#1877F2] to-[#0D6EFD]";
      default: return "bg-gradient-to-r from-[#87CEFA] to-[#40E0D0]";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-[#10B981]";
      case "scheduled": return "bg-[#87CEFA]";
      case "draft": return "bg-[#F59E0B]";
      default: return "bg-gray-400";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-[#1E293B] mb-2">
                Content Calendar
              </h1>
              <p className="text-[#64748B] text-lg">
                Plan and schedule your posts with our drag-and-drop calendar.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddPost(true)}
              className="bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              + Schedule Post
            </motion.button>
          </div>

          {/* Calendar Controls */}
          <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <h2 className="text-xl font-semibold text-[#1E293B]">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "month" 
                    ? "bg-[#87CEFA] text-white" 
                    : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === "week" 
                    ? "bg-[#87CEFA] text-white" 
                    : "bg-gray-100 text-[#64748B] hover:bg-gray-200"
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-gradient-to-r from-[#87CEFA]/10 to-[#40E0D0]/10 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="p-4 text-center font-semibold text-[#1E293B]">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => (
              <motion.div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 ${
                  !day.isCurrentMonth ? "bg-gray-50" : "bg-white"
                } ${day.isToday ? "bg-gradient-to-r from-[#87CEFA]/5 to-[#40E0D0]/5" : ""}`}
                whileHover={{ backgroundColor: day.isCurrentMonth ? "#F8FAFC" : "#F1F5F9" }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    day.isToday 
                      ? "bg-[#87CEFA] text-white rounded-full w-6 h-6 flex items-center justify-center"
                      : day.isCurrentMonth 
                        ? "text-[#1E293B]" 
                        : "text-[#94A3B8]"
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {day.posts.length > 0 && (
                    <span className="text-xs bg-[#87CEFA] text-white rounded-full px-2 py-1">
                      {day.posts.length}
                    </span>
                  )}
                </div>

                {/* Posts for this day */}
                <div className="space-y-1">
                  <AnimatePresence>
                    {day.posts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`p-2 rounded-lg text-xs cursor-pointer transition-all duration-200 hover:shadow-md ${
                          getPlatformColor(post.platform)
                        } text-white`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate">{post.platform}</span>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(post.status)}`} />
                        </div>
                        <div className="truncate font-medium">{post.title}</div>
                        <div className="text-white/80">{formatTime(post.scheduledDate)}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Scheduled Posts", value: scheduledPosts.filter(p => p.status === "scheduled").length, color: "from-[#87CEFA] to-[#ADD8E6]" },
            { label: "Draft Posts", value: scheduledPosts.filter(p => p.status === "draft").length, color: "from-[#F59E0B] to-[#FCD34D]" },
            { label: "Published This Month", value: scheduledPosts.filter(p => p.status === "published").length, color: "from-[#10B981] to-[#34D399]" },
            { label: "Total Posts", value: scheduledPosts.length, color: "from-[#40E0D0] to-[#7FFFD4]" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <span className="text-white text-xl font-bold">{stat.value}</span>
              </div>
              <div className="text-sm text-[#64748B]">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Add Post Modal Placeholder */}
        {showAddPost && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-[#1E293B] mb-4">Schedule New Post</h3>
              <p className="text-[#64748B] mb-6">This feature will allow you to create and schedule new posts directly from the calendar.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddPost(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-[#64748B] rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddPost(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#87CEFA] to-[#40E0D0] text-white rounded-lg hover:shadow-lg transition-all duration-300"
                >
                  Coming Soon
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 