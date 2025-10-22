"use client";

import DashboardLayout from "@/components/DashboardLayout";
import AIContentOptimizer from "@/components/AIContentOptimizer";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";

export default function AIOptimizerPage() {
  return (
    <DashboardLayout>
      <Container className="py-8">
        <PageHeader
          title="AI Content Optimizer"
          subtitle="Optimize your content for maximum engagement using advanced AI"
        />
        <AIContentOptimizer />
      </Container>
    </DashboardLayout>
  );
}
