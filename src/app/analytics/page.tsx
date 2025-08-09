"use client";
import DashboardLayout from "@/components/DashboardLayout";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <Container className="py-8">
        <PageHeader
          title="Advanced Analytics"
          subtitle="Comprehensive insights and reporting for your performance"
        />
        <AdvancedAnalytics />
      </Container>
    </DashboardLayout>
  );
} 