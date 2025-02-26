import { AppointmentsContent } from "./appointments-content";
import DashboardContent from "./dashboard-content";
import { DoctorsContent } from "./doctors-content";
import { HomeContent } from "./home-content";
import ReportsContent from "./reports-content";
import EducationContent from "./education-content";
import { LabContent } from "./lab-content";
import DietPlanPage from "./diet-content";
import { PrescriptionContent } from "./prescription-content";
import MentalHealthPage from "./mentalhealth-content";
import RiskAssessment from "./risk-content";
import { DrAppointmentsContent } from "./dr-appointments-content";
import communityContent from "./community-content";
import AiChatContent from "../ai-chat/ai-chat-content";
import KanbanContent from "./kanban-content";
import calanderContent from "./calander-content";
import PatientDashboard from "./patient-stat-content";
import PatientListStat from "./patient-list-content";
import ConsultDoctor from "./consult-doctor-content";
import MapsContent from "./maps-content";
import HealthMonitoringContent from "./health-monitoring-content";
import SymptomTrackingContent from "./symptom-tracking-content";
export const contentComponents = {
  home: HomeContent,
  dashboard: DashboardContent,
  appointments: AppointmentsContent,
  doctors: DoctorsContent,
  reports: ReportsContent,
  lab: LabContent,
  risk: RiskAssessment,
  diet: DietPlanPage,
  mentalhealth: MentalHealthPage,
  prescription: PrescriptionContent,
  education: EducationContent,
  community: communityContent,
  aichat: AiChatContent,
  kanban: KanbanContent,
  drappointments: DrAppointmentsContent,
  calander: calanderContent,
  patientStat: PatientDashboard,
  PatientList: PatientListStat,
  consultDoc: ConsultDoctor,
  mapContent: MapsContent,
  healthMonitoring: HealthMonitoringContent,
  symptomTracking: SymptomTrackingContent,
};

export type ContentKey = keyof typeof contentComponents;
