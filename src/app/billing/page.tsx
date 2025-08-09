"use client";
import DashboardLayout from "@/components/DashboardLayout";
import BillingManagement from "@/components/BillingManagement";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";

export default function BillingPage() {
  return (
    <DashboardLayout>
      <Container className="py-8">
        <PageHeader
          title="Billing & Subscription"
          subtitle="Manage your plan, usage, and invoices"
        />
        <BillingManagement />
      </Container>
    </DashboardLayout>
  );
} 