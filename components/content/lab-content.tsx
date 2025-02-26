"use client";

import { useState } from "react";
import {
  DiseaseCard,
  ImageTestCard,
} from "@/components/lab-tests/disease-card";
import { TestModal } from "@/components/lab-tests/test-modal";
import { ImageTestModal } from "@/components/lab-tests/image-test-modal";
import { Disease, diseases } from "@/lib/diseases";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function LabContent() {
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [testResults, setTestResults] = useState<
    Record<string, number | { prediction: string; confidence: string }>
  >({});
  const [selectedImageTest, setSelectedImageTest] = useState<string | null>(
    null
  );

  const imageTests = [
    {
      name: "Eye Disease",
      description:
        "Categories: Normal, Diabetic Retinopathy, Cataract, Glaucoma.",
    },
    {
      name: "Brain Tumor",
      description:
        "A mass of tissue within the brain that can be either benign or malignant.",
    },
    {
      name: "Pneumonia",
      description:
        "An infection that inflames the air sacs in one or both lungs",
    },
  ];

  const handleStartTest = (disease: Disease) => setSelectedDisease(disease);
  const handleStartImageTest = (diseaseName: string) =>
    setSelectedImageTest(diseaseName);

  const handleTestComplete = (diseaseId: string, score: number) => {
    setTestResults((prev) => ({
      ...prev,
      [diseaseId]: score,
    }));
    setSelectedDisease(null);
  };

  const handleImageTestComplete = async (
    diseaseName: string,
    result: { prediction: string; confidence: string }
  ) => {
    setTestResults((prev) => ({
      ...prev,
      [diseaseName]: result,
    }));
    setSelectedImageTest(null);

    try {
      await fetch("/api/lab-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diseaseId: diseaseName,
          answers: {},
          riskScore: parseInt(result.confidence),
        }),
      });
    } catch (error) {
      console.error("Failed to save lab test:", error);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto border-2 border-gray-200 dark:border-gray-800 shadow-lg">
      <CardHeader className="border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-2xl font-bold text-center">
          Laboratory Tests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[550px] pr-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Questionnaire Tests
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {diseases.map((disease) => (
                  <div key={disease.id} className="group">
                    <div className="transition-all duration-200 transform hover:-translate-y-2 hover:shadow-lg">
                      <DiseaseCard
                        disease={disease}
                        result={testResults[disease.id] as number}
                        onStartTest={() => handleStartTest(disease)}
                        className="border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h2 className="text-xl font-semibold mb-4">Imaging Tests</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imageTests.map((test) => (
                  <div key={test.name} className="group">
                    <div className="transition-all duration-200 transform hover:-translate-y-2 hover:shadow-lg">
                      <ImageTestCard
                        diseaseName={test.name}
                        description={test.description}
                        onStartTest={() => handleStartImageTest(test.name)}
                        prediction={testResults[test.name]?.prediction}
                        confidence={testResults[test.name]?.confidence}
                        className="border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <TestModal
          disease={selectedDisease}
          onClose={() => setSelectedDisease(null)}
          onComplete={handleTestComplete}
        />
        <ImageTestModal
          diseaseName={selectedImageTest}
          onClose={() => setSelectedImageTest(null)}
          onComplete={handleImageTestComplete}
        />
      </CardContent>
    </Card>
  );
}
