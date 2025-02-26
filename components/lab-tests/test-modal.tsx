"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Disease } from "@/lib/diseases";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon, Upload, FileUp, Check, AlertCircle } from "lucide-react";
import { predictDisease } from "@/lib/api";
import { extractValuesFromPDF } from "@/lib/pdf-service";
import { toast } from "@/hooks/use-toast"; 

interface TestModalProps {
  disease: Disease | null;
  onClose: () => void;
  onComplete: (diseaseId: string, score: number) => void;
}

export function TestModal({ disease, onClose, onComplete }: TestModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [followUpAnswers, setFollowUpAnswers] = useState<
    Record<string, string>
  >({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [filledFields, setFilledFields] = useState<Set<string>>(new Set());
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Set<number>>(new Set());

  if (!disease) return null;

  const validateForm = (): boolean => {
    const newErrors = new Set<number>();

    disease?.questions.forEach((question, index) => {
      // Check if answer is missing
      if (!answers[index] || answers[index].trim() === '') {
        newErrors.add(index);
      }
      // Check follow-up questions if applicable
      if (question.followUp && answers[index] === 'Yes' && (!followUpAnswers[index] || followUpAnswers[index].trim() === '')) {
        newErrors.add(index);
      }
    });

    setValidationErrors(newErrors);
    
    if (newErrors.size > 0) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all required questions to proceed.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const formData = disease.questions.reduce((acc, question, index) => {
      // Add main answer
      acc[question.text.toLowerCase().replace(/\s+/g, "_")] = answers[index];

      // Add follow-up answer if exists
      if (question.followUp && answers[index] === "Yes") {
        acc[question.followUp.text.toLowerCase().replace(/\s+/g, "_")] =
          followUpAnswers[index];
      }

      return acc;
    }, {} as Record<string, string>);

    try {
      const score = await predictDisease(disease.id, formData);

      // Save the test results to the database
      const response = await fetch("/api/lab-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diseaseId: disease.id,
          answers: formData,
          riskScore: score,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save test results");
      }

      onComplete(disease.id, score);
    } catch (error) {
      console.error("Error:", error);
      // Handle error appropriately
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !disease) return;

    setIsProcessing(true);
    setUploadStatus('processing');
    setErrorMessage('');

    try {
      const extractedValues = await extractValuesFromPDF(file, disease);
      
      const filledFieldsSet = new Set<string>();
      const newAnswers: Record<string, string> = { ...answers };
      
      disease.questions.forEach((question, index) => {
        const value = extractedValues[question.text];
        if (value !== undefined) {
          // Value is already sanitized by pdf-service
          newAnswers[index] = value;
          filledFieldsSet.add(question.text);
        }
      });

      setAnswers(newAnswers);
      setFilledFields(filledFieldsSet);
      setUploadStatus('success');
    } catch (error) {
      console.error("Failed to process PDF:", error);
      setErrorMessage('Failed to process the report. Please try again.');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderQuestion = (question: Disease["questions"][0], index: number) => {
    const inputId = `question-${index}`;
    const questionValue = answers[index];
    const isFilledFromPDF = filledFields.has(question.text);
    const hasError = validationErrors.has(index);

    return (
      <div 
        key={index} 
        className={`space-y-2 ${isFilledFromPDF ? 'bg-muted/30' : ''} ${
          hasError ? 'border-l-2 border-destructive p-2' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label htmlFor={inputId} className={hasError ? 'text-destructive' : ''}>
              {question.text}
              {question.unit ? ` (${question.unit})` : ""}
              <span className="text-destructive ml-1">*</span>
            </Label>
            {question.tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{question.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {hasError && (
            <span className="text-xs text-destructive">
              Required
            </span>
          )}
          {isFilledFromPDF && (
            <span className="text-xs text-muted-foreground">
              Auto-filled from report
            </span>
          )}
        </div>

        {question.type === "radio" ? (
          <RadioGroup
            value={questionValue}
            onValueChange={(value) => {
              setAnswers((prev) => ({ ...prev, [index]: value }));
              if (validationErrors.has(index)) {
                const newErrors = new Set(validationErrors);
                newErrors.delete(index);
                setValidationErrors(newErrors);
              }
            }}
            className={hasError ? 'border border-destructive rounded-md p-2' : ''}
          >
            <div className="flex gap-4">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${inputId}-${option}`} />
                  <Label htmlFor={`${inputId}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        ) : (
          <div className="relative">
            <Input
              id={inputId}
              type="number"
              value={questionValue || ""}
              onChange={(e) => {
                setAnswers((prev) => ({ ...prev, [index]: e.target.value }));
                if (validationErrors.has(index)) {
                  const newErrors = new Set(validationErrors);
                  newErrors.delete(index);
                  setValidationErrors(newErrors);
                }
              }}
              className={`w-full ${hasError ? 'border-destructive' : ''}`}
              placeholder={question.tooltip || `Enter ${question.text.toLowerCase()}`}
            />
          </div>
        )}

        {question.followUp && questionValue === "Yes" && (
          <div className="ml-6 mt-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor={`followup-${index}`} className={hasError ? 'text-destructive' : ''}>
                {question.followUp.text}
                {question.followUp.unit ? ` (${question.followUp.unit})` : ""}
              </Label>
              {question.followUp.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{question.followUp.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              id={`followup-${index}`}
              type="number"
              value={followUpAnswers[index] || ""}
              onChange={(e) => {
                setFollowUpAnswers((prev) => ({
                  ...prev,
                  [index]: e.target.value,
                }));
                if (validationErrors.has(index)) {
                  const newErrors = new Set(validationErrors);
                  newErrors.delete(index);
                  setValidationErrors(newErrors);
                }
              }}
              className={`w-full ${hasError ? 'border-destructive' : ''}`}
              placeholder={
                question.followUp.tooltip ||
                `Enter ${question.followUp.text.toLowerCase()}`
              }
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={!!disease} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{disease.name} Assessment</DialogTitle>
          
          <div className="mt-4 mb-6">
            <div className="flex flex-col items-center space-y-4">
              <input
                type="file"
                id="pdf-upload"
                className="hidden"
                accept="application/pdf"
                onChange={handlePDFUpload}
                disabled={isProcessing}
              />
              
              <div className="w-full p-6 border-2 border-dashed rounded-lg hover:border-primary/50 transition-colors">
                <Label
                  htmlFor="pdf-upload"
                  className={`flex flex-col items-center gap-2 cursor-pointer ${isProcessing ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  {uploadStatus === 'idle' && (
                    <>
                      <FileUp className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium">Upload Medical Report</p>
                        <p className="text-xs text-muted-foreground">
                          Drop your PDF report here or click to browse
                        </p>
                      </div>
                    </>
                  )}
                  
                  {uploadStatus === 'processing' && (
                    <>
                      <div className="animate-pulse">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Processing Report...</p>
                    </>
                  )}
                  
                  {uploadStatus === 'success' && (
                    <>
                      <Check className="h-8 w-8 text-green-500" />
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-green-500">Report Processed Successfully</p>
                        <p className="text-xs text-muted-foreground">Click to upload another report</p>
                      </div>
                    </>
                  )}
                  
                  {uploadStatus === 'error' && (
                    <>
                      <AlertCircle className="h-8 w-8 text-destructive" />
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-destructive">{errorMessage}</p>
                        <p className="text-xs text-muted-foreground">Click to try again</p>
                      </div>
                    </>
                  )}
                </Label>
              </div>

              <Separator className="w-full" />
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {disease.questions.map((question, index) =>
              renderQuestion(question, index)
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
