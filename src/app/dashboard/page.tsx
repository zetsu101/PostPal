import DashboardLayout from "@/components/DashboardLayout";
import AIContentGenerator from "@/components/AIContentGenerator";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#1F2937] mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-[#6B7280] text-lg">
            Ready to create some amazing content today?
          </p>
        </div>

        {/* AI Content Generator Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-heading font-bold text-[#FF6B6B] mb-4">
            What should I post today?
          </h2>
          <p className="text-[#6B7280] mb-6">
            Based on your brand profile, here are some AI-generated post ideas:
          </p>
          
          <AIContentGenerator />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-heading font-bold text-[#60A5FA] mb-2">
              📅 Content Calendar
            </h3>
            <p className="text-[#6B7280] mb-4">
              Plan your posts with our drag-and-drop calendar.
            </p>
            <button className="bg-[#60A5FA] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3B82F6] transition-colors">
              View Calendar
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-heading font-bold text-[#34D399] mb-2">
              💾 Saved Posts
            </h3>
            <p className="text-[#6B7280] mb-4">
              Access your previously saved post ideas.
            </p>
            <button className="bg-[#34D399] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#10B981] transition-colors">
              View Saved
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 