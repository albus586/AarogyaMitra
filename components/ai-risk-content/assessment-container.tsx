"use client";

import { useState } from "react";
import AssessmentForm from "./assessment-form";
import Results from "./results";
import { Toaster } from "@/components/ui/toaster";

interface AssessmentResult {
  symptoms: string[];
  predictedDisease: string;
}

export default function AssessmentContainer() {
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [results, setResults] = useState<AssessmentResult>({
    symptoms: [],
    predictedDisease: "Normal",
  });

  const handleComplete = (assessmentResults: AssessmentResult) => {
    setResults(assessmentResults);
    setAssessmentComplete(true);
  };

  const handleRetake = () => {
    setAssessmentComplete(false);
    setResults({ symptoms: [], predictedDisease: "Normal" });
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {!assessmentComplete ? (
        <AssessmentForm onComplete={handleComplete} />
      ) : (
        <Results
          symptoms={results.symptoms}
          predictedDisease={results.predictedDisease}
          onRetake={handleRetake}
        />
      )}
      <Toaster />
    </div>
  );
}
