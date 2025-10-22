import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import MonitoringDashboard from "@/components/MonitoringDashboard";

export default function MonitoringPage() {
  return (
    <Container>
      <PageHeader
        title="System Monitoring"
        subtitle="Real-time performance monitoring and analytics dashboard"
      />
      
      <div className="mt-8">
        <MonitoringDashboard />
      </div>
    </Container>
  );
}
