import DashboardLayout from "@/components/DashboardLayout";

export default function SavedPostsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#1F2937] mb-2">
            Saved Posts
          </h1>
          <p className="text-[#6B7280] text-lg">
            Your collection of AI-generated post ideas and saved content.
          </p>
        </div>

        {/* Filters Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-[#6B7280] font-medium">Filter by:</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-full bg-[#FACC15] text-white text-sm font-medium">
                All Posts
              </button>
              <button className="px-3 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280] text-sm font-medium hover:bg-[#E5E7EB]">
                Instagram
              </button>
              <button className="px-3 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280] text-sm font-medium hover:bg-[#E5E7EB]">
                TikTok
              </button>
              <button className="px-3 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280] text-sm font-medium hover:bg-[#E5E7EB]">
                LinkedIn
              </button>
            </div>
          </div>
        </div>

        {/* Saved Posts Grid Placeholder */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-[#E5E7EB]">
              <div className="text-[#9CA3AF] text-sm mb-2">[Saved Post {i}]</div>
              <div className="text-[#6B7280] text-xs mb-4">Title, Caption, Hashtags, Image Prompt</div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-full bg-[#60A5FA] text-white text-xs font-medium hover:bg-[#3B82F6]">
                  Edit
                </button>
                <button className="px-3 py-1 rounded-full bg-[#34D399] text-white text-xs font-medium hover:bg-[#10B981]">
                  Regenerate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 