import HealthMonitoringContent from "@/components/content/health-monitoring-content";

export default function PatientDashboardPage({
  params,
}: {
  params: { patientEmail: string };
}) {
  const decodedEmail = decodeURIComponent(params.patientEmail);
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Dashboard for {decodedEmail}
      </h1>
      <HealthMonitoringContent patientEmail={decodedEmail} />
    </div>
  );
}
