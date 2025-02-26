"use client";

import { useState, useEffect } from "react";
import { MentalVitalsModal } from "@/components/mental-health/mental-vitals-modal";
import { MentalFitnessDashboard } from "@/components/mental-health/mental-fitness-dashboard";
import { Button } from "@/components/ui/button";

export default function MentalHealthPage() {
  const [showModal, setShowModal] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<Date | null>(null);
  const [mentalScore, setMentalScore] = useState<number | null>(null);
  const [voiceAnalysis, setVoiceAnalysis] = useState<any>(null);

  // Fetch existing data on component mount
  useEffect(() => {
    fetchMentalHealthData();
  }, []);

  const fetchMentalHealthData = async () => {
    try {
      const response = await fetch('/api/mental-health');
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const latestRecord = data[0];
          setLastSubmission(new Date(latestRecord.timestamp));
          setMentalScore(latestRecord.mentalFitnessScore);
          setVoiceAnalysis(latestRecord.voiceAnalysis);
        }
      }
    } catch (error) {
      console.error('Failed to fetch mental health data:', error);
    }
  };

  const handleSubmit = async (formData: any, score: number, voiceAnalysis?: any) => {
    try {
      const response = await fetch('/api/mental-health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          score,
          voiceAnalysis
        }),
      });

      if (response.ok) {
        setLastSubmission(new Date());
        setMentalScore(score);
        if (voiceAnalysis) {
          setVoiceAnalysis(voiceAnalysis);
        }
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to save mental health data:', error);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => setShowModal(true)}>Record Mental Vitals</Button>
      </div>

      <MentalFitnessDashboard
        lastSubmission={lastSubmission}
        mentalScore={mentalScore}
        voiceAnalysis={voiceAnalysis}
      />
      <MentalVitalsModal
        open={showModal}
        onOpenChange={setShowModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
