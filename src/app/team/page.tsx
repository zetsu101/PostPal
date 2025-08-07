"use client";
import DashboardLayout from "@/components/DashboardLayout";
import TeamCollaboration from "@/components/TeamCollaboration";

export default function TeamPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <TeamCollaboration />
      </div>
    </DashboardLayout>
  );
} 