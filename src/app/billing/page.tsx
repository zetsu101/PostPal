"use client";
import DashboardLayout from "@/components/DashboardLayout";
import BillingManagement from "@/components/BillingManagement";

export default function BillingPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <BillingManagement />
      </div>
    </DashboardLayout>
  );
} 