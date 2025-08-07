"use client";
import DashboardLayout from "@/components/DashboardLayout";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <AdvancedAnalytics />
      </div>
    </DashboardLayout>
  );
} 