"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ImageTestModalProps {
  diseaseName: string | null;
  onClose: () => void;
  onComplete: (
    diseaseName: string,
    result: { prediction: string; confidence: string }
  ) => void;
}

export function ImageTestModal({
  diseaseName,
  onClose,
  onComplete,
}: ImageTestModalProps) {
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!image || !diseaseName) return;

    const formData = new FormData();
    formData.append("image", image);

    let endpoint = "";
    if (diseaseName === "Eye Disease") {
      endpoint = "/eye";
    } else if (diseaseName === "Brain Tumor") {
      endpoint = "/brain";
    } else if (diseaseName === "Pneumonia") {
      endpoint = "/pneumonia";
    }

    try {
      const response = await fetch(
        `https://image-models-965346204364.asia-south1.run.app${endpoint}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      onComplete(diseaseName, result);
    } catch (error) {
      console.error("Error:", error);
    }

    onClose();
  };

  if (!diseaseName) return null;

  return (
    <Dialog open={!!diseaseName} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image for {diseaseName}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {image && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full">
            Submit
          </Button>
        </DialogFooter>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
