import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type FollowUpSteps = {
  [key: string]: {
    steps: string[];
    recoveryDays: number;
  };
};

const followUpSteps: FollowUpSteps = {
  Diabetes: {
    steps: [
      "Consult a doctor for a blood sugar test.",
      "Monitor your diet and reduce sugar intake.",
      "Exercise regularly and maintain a healthy weight.",
    ],
    recoveryDays: 30,
  },
  Hypertension: {
    steps: [
      "Check your blood pressure regularly.",
      "Reduce salt intake and avoid processed foods.",
      "Consult a doctor for medication if needed.",
    ],
    recoveryDays: 60,
  },
  "Heart Disease": {
    steps: [
      "Seek immediate medical attention if you have chest pain.",
      "Adopt a heart-healthy diet (low fat, low cholesterol).",
      "Exercise regularly and avoid smoking.",
    ],
    recoveryDays: 90,
  },
  "Eye Disease": {
    steps: [
      "Visit an ophthalmologist for a comprehensive eye exam.",
      "Avoid straining your eyes and use protective eyewear.",
      "Follow prescribed treatments for any diagnosed condition.",
    ],
    recoveryDays: 45,
  },
  "Brain Tumor": {
    steps: [
      "Consult a neurologist immediately for further evaluation.",
      "Undergo imaging tests like MRI or CT scan.",
      "Follow the treatment plan recommended by your doctor.",
    ],
    recoveryDays: 180,
  },
  Pneumonia: {
    steps: [
      "Seek medical attention for antibiotics or antiviral treatment.",
      "Rest and stay hydrated.",
      "Monitor your temperature and seek emergency care if symptoms worsen.",
    ],
    recoveryDays: 21,
  },
  Normal: {
    steps: [
      "No specific disease detected. Maintain a healthy lifestyle.",
      "If symptoms persist, consult a doctor for further evaluation.",
    ],
    recoveryDays: 0,
  },
};

interface ResultsProps {
  symptoms: string[];
  predictedDisease: string;
  onRetake: () => void;
}

export default function Results({
  symptoms = [],
  predictedDisease = "Normal",
  onRetake,
}: ResultsProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const safeSymptoms = symptoms || [];

  const saveAssessment = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/ai-risk-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: safeSymptoms,
          predictedDisease,
          followUpSteps: followUpSteps[predictedDisease]?.steps || [],
          recoveryDays: followUpSteps[predictedDisease]?.recoveryDays || 0,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Assessment saved successfully",
          variant: "default",
          className: "bg-green-500 text-white",
        });
      } else if (data.error === "Disease already exists") {
        toast({
          title: "Warning",
          description: "This disease assessment already exists for you",
          variant: "destructive",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save assessment",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Assessment Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Your reported symptoms:</h3>
          {safeSymptoms.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {safeSymptoms.map((symptom, index) => (
                <li key={`${symptom}-${index}`}>{symptom}</li>
              ))}
            </ul>
          ) : (
            <p>No symptoms reported</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">
            Based on your symptoms, you might have:
          </h3>
          <p className="text-lg text-primary">{predictedDisease}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Follow-up steps:</h3>
          <ul className="list-disc pl-5 space-y-1">
            {followUpSteps[predictedDisease]?.steps.map((step, index) => (
              <li key={`step-${index}`}>{step}</li>
            )) ?? <li>No specific follow-up steps available</li>}
          </ul>
          <h3 className="font-semibold mt-4 mb-2">Estimated Recovery Time:</h3>
          <p className="text-primary">
            {followUpSteps[predictedDisease]?.recoveryDays} days
          </p>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          This is not a medical diagnosis. Please consult with a healthcare
          professional for proper medical advice.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-6">
        <Button
          onClick={onRetake}
          variant="outline"
          className="w-full max-w-xs mr-2"
          disabled={isSaving}
        >
          Retake Assessment
        </Button>
        <Button 
          onClick={saveAssessment} 
          className="w-full max-w-xs ml-2"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Results"}
        </Button>
      </CardFooter>
    </Card>
  );
}
