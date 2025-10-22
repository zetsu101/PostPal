"use client";
import DashboardLayout from "@/components/DashboardLayout";
import TeamCollaborationAdvanced from "@/components/TeamCollaborationAdvanced";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";

export default function TeamPage() {
  return (
    <DashboardLayout>
      <Container className="py-8">
        <PageHeader
          title="Team Collaboration"
          subtitle="Manage members, workspaces, and approvals"
        />
        <TeamCollaborationAdvanced />
      </Container>
    </DashboardLayout>
  );
} 