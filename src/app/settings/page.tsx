import DashboardLayout from "@/components/DashboardLayout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[#1F2937] mb-2">
            Settings
          </h1>
          <p className="text-[#6B7280] text-lg">
            Manage your brand profile, billing, and team settings.
          </p>
        </div>

        <div className="space-y-6">
          {/* Brand Profile Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-heading font-bold text-[#FF6B6B] mb-4">
              Brand Profile
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Brand Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:border-[#FF6B6B] focus:outline-none"
                    placeholder="Your brand name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#374151] mb-2">Industry</label>
                  <select className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:border-[#FF6B6B] focus:outline-none">
                    <option>Select industry</option>
                    <option>Fashion</option>
                    <option>Fitness</option>
                    <option>Food & Beverage</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">Target Audience</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:border-[#FF6B6B] focus:outline-none"
                  placeholder="e.g. Young entrepreneurs"
                />
              </div>
              <button className="bg-[#FF6B6B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#EF4444] transition-colors">
                Update Profile
              </button>
            </div>
          </div>

          {/* Billing Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-heading font-bold text-[#60A5FA] mb-4">
              Billing & Subscription
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg">
                <div>
                  <h3 className="font-semibold text-[#1F2937]">Pro Plan</h3>
                  <p className="text-[#6B7280] text-sm">$12/month</p>
                </div>
                <button className="px-4 py-2 rounded-lg bg-[#60A5FA] text-white font-medium hover:bg-[#3B82F6] transition-colors">
                  Manage Billing
                </button>
              </div>
            </div>
          </div>

          {/* Team Management Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-heading font-bold text-[#34D399] mb-4">
              Team Management
            </h2>
            <div className="space-y-4">
              <p className="text-[#6B7280]">Invite team members to collaborate on your content.</p>
              <div className="flex gap-4">
                <input
                  type="email"
                  className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg focus:border-[#34D399] focus:outline-none"
                  placeholder="Enter email address"
                />
                <button className="px-4 py-2 rounded-lg bg-[#34D399] text-white font-medium hover:bg-[#10B981] transition-colors">
                  Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 