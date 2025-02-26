"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Disease-symptom mapping
const diseases: { [key: string]: string[] } = {
  Diabetes: [
    "fatigue",
    "frequent urination",
    "excessive thirst",
    "blurred vision",
    "unexplained weight loss",
    "slow-healing sores",
  ],
  Hypertension: [
    "headache",
    "dizziness",
    "blurred vision",
    "shortness of breath",
    "chest pain",
    "nosebleeds",
  ],
  "Heart Disease": [
    "chest pain",
    "shortness of breath",
    "fatigue",
    "irregular heartbeat",
    "swelling in legs",
    "dizziness",
  ],
  "Eye Disease": [
    "blurred vision",
    "eye pain",
    "sensitivity to light",
    "double vision",
    "loss of peripheral vision",
    "seeing halos around lights",
  ],
  "Brain Tumor": [
    "headache",
    "nausea",
    "fatigue",
    "vision problems",
    "memory problems",
    "seizures",
  ],
  Pneumonia: [
    "cough",
    "fever",
    "shortness of breath",
    "fatigue",
    "chest pain",
    "nausea",
  ],
  Normal: [],
};

interface AssessmentFormProps {
  onComplete: (results: {
    symptoms: string[];
    predictedDisease: string;
  }) => void;
}

export default function AssessmentForm({ onComplete }: AssessmentFormProps) {
  const [currentSymptom, setCurrentSymptom] = useState<string>("");
  const [askedSymptoms, setAskedSymptoms] = useState<Set<string>>(new Set());
  const [userSymptoms, setUserSymptoms] = useState<string[]>([]);
  const [possibleDiseases, setPossibleDiseases] = useState<Set<string>>(
    new Set(Object.keys(diseases))
  );
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const findNextSymptom = useCallback(() => {
    const remainingSymptoms = new Set(
      Array.from(possibleDiseases)
        .flatMap((disease) => diseases[disease])
        .filter((symptom) => !askedSymptoms.has(symptom))
    );

    if (
      remainingSymptoms.size === 0 ||
      possibleDiseases.size === 1 ||
      askedSymptoms.size >= 5
    ) {
      setIsComplete(true);
      const predictedDisease =
        possibleDiseases.size > 0 ? Array.from(possibleDiseases)[0] : "Normal";
      onComplete({
        symptoms: userSymptoms,
        predictedDisease,
      });
      return;
    }

    const symptomCounts: { [key: string]: number } = {};
    remainingSymptoms.forEach((symptom) => {
      symptomCounts[symptom] = Array.from(possibleDiseases).filter((disease) =>
        diseases[disease].includes(symptom)
      ).length;
    });

    const nextSymptom = Object.entries(symptomCounts).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0];

    setCurrentSymptom(nextSymptom);
  }, [askedSymptoms, possibleDiseases, userSymptoms, onComplete]);

  useEffect(() => {
    if (!isComplete) {
      findNextSymptom();
    }
  }, [findNextSymptom, isComplete]);

  useEffect(() => {
    setProgress((askedSymptoms.size / 5) * 100);
  }, [askedSymptoms]);

  const handleAnswer = (hasSymptom: boolean) => {
    const newAskedSymptoms = new Set(askedSymptoms);
    newAskedSymptoms.add(currentSymptom);
    setAskedSymptoms(newAskedSymptoms);

    if (hasSymptom) {
      setUserSymptoms([...userSymptoms, currentSymptom]);
      setPossibleDiseases(
        new Set(
          Array.from(possibleDiseases).filter((disease) =>
            diseases[disease].includes(currentSymptom)
          )
        )
      );
    } else {
      setPossibleDiseases(
        new Set(
          Array.from(possibleDiseases).filter(
            (disease) => !diseases[disease].includes(currentSymptom)
          )
        )
      );
    }
  };

  const handlePrevious = () => {
    const lastSymptom = Array.from(askedSymptoms).pop();
    if (lastSymptom) {
      setAskedSymptoms(new Set(Array.from(askedSymptoms).slice(0, -1)));
      setUserSymptoms(userSymptoms.filter((symptom) => symptom !== lastSymptom));
      setPossibleDiseases(new Set(Object.keys(diseases)));
      setIsComplete(false);
    }
  };

  if (isComplete) {
    return null;
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Symptom Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          Question {askedSymptoms.size + 1} of 5
        </div>
        <Progress value={progress} className="mb-4" />
        <div className="text-lg mb-6">Do you experience {currentSymptom}?</div>
        <div className="flex gap-4">
          <Button
            onClick={() => handleAnswer(true)}
            // className="bg-gray-200 hover:bg-green-500 active:bg-green-700"
          >
            Yes
          </Button>
          <Button
            variant="outline"
            onClick={() => handleAnswer(false)}
            // className="bg-gray-200 hover:bg-red-500 active:bg-red-700"
          >
            No
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={askedSymptoms.size === 0}
        >
          Previous
        </Button>
       
      </CardFooter>
    </Card>
  );
}
