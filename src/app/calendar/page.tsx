import DashboardLayout from "@/components/DashboardLayout";

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#1F2937] mb-2">
            Content Calendar
          </h1>
          <p className="text-[#6B7280] text-lg">
            Plan and schedule your posts with our drag-and-drop calendar.
          </p>
        </div>

        {/* Calendar Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-heading font-bold text-[#34D399] mb-2">
              Drag-and-Drop Calendar
            </h2>
            <p className="text-[#6B7280] mb-6">
              Visual calendar interface coming soon. You&apos;ll be able to drag posts from your AI-generated ideas directly onto specific dates.
            </p>
            <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB] max-w-md mx-auto">
              <div className="text-[#9CA3AF] text-sm">[Calendar Grid with Post Cards]</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 