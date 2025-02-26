"use client";

import AssessmentContainer from "@/components/ai-risk-content/assessment-container";

export default function RiskContent() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-items-start p-24">
      <h1 className="mb-8 text-4xl font-bold">AI Health Risk Assessment</h1>
      <AssessmentContainer />
    </main>
  );
}
