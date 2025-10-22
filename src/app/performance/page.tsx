"use client";

import DashboardLayout from "@/components/DashboardLayout";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <Container className="py-8">
        <PageHeader
          title="Performance Optimization"
          subtitle="Monitor and optimize your application performance in real-time"
        />
        <PerformanceOptimizer />
      </Container>
    </DashboardLayout>
  );
}
