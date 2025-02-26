import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchAmazonProducts, type ProductInfo } from "@/utils/amazon-scraper";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import {
  Mic,
  Phone,
  Bot,
  User,
  Loader2,
  Upload,
  Plus,
  FileText,
  FilePlus2,
  Trash2,
  FileImage,
  FileType,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  emotions?: {
    realization: number;
    calmness: number;
    disappointment: number;
    excitement: number;
    distress: number;
    surprise: number;
    amusement: number;
    awkwardness: number;
    interest: number;
  };
  document?: ProcessedFile;
  imageUrl?: string; // Add this line
  products?: ProductInfo[];
}

interface EmotionBarProps {
  emotion: string;
  value: number;
  color: string;
}

interface ProcessedFile {
  name: string;
  type: string;
  content: string;
  originalFile: File;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/"))
    return <FileImage className="w-4 h-4 text-blue-500" />;
  if (type.includes("pdf"))
    return <FileType className="w-4 h-4 text-red-500" />;
  return <FileText className="w-4 h-4 text-blue-500" />;
};

const EmotionBar: React.FC<EmotionBarProps> = ({ emotion, value, color }) => (
  <div className="flex items-center gap-3 w-full mb-2.5">
    <span className="text-sm font-medium w-32 text-gray-700">{emotion}</span>
    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
    <span className="text-sm font-medium text-gray-500 w-16 text-right">
      {(value * 100).toFixed(0)}%
    </span>
  </div>
);

// Add this helper function
const cleanAIResponse = (text: string): string => {
  return text
    .replace(/\*\*/g, "") // Remove **
    .replace(/\*/g, "") // Remove single *
    .replace(/\n\d\./g, "\n•") // Replace numbered lists with bullet points
    .trim();
};

const ProductRecommendation: React.FC<{ product: ProductInfo }> = ({
  product,
}) => (
  <div className="flex flex-col gap-2 p-4 border rounded-lg bg-white shadow-sm">
    <div className="flex gap-4">
      <img
        src={product.imageUrl}
        alt={product.title}
        className="w-24 h-24 object-contain"
      />
      <div className="flex-1">
        <h3 className="font-medium text-sm">{product.title}</h3>
        <p className="text-sm text-gray-600">Brand: {product.brand}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold">₹{product.price}</span>
          <span className="text-sm text-gray-500">{product.rating}</span>
        </div>
      </div>
    </div>
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full mt-2 px-4 py-2 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 transition-colors"
    >
      View on Amazon
    </a>
  </div>
);

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === "user";
  const getTop3Emotions = (emotions: any) => {
    if (!emotions) return [];
    return Object.entries(emotions)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3);
  };

  return (
    <div
      className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} mb-8`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`flex flex-col ${
          isUser ? "items-end" : "items-start"
        } max-w-[85%]`}
      >
        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden border shadow-sm">
            <Image
              src={message.imageUrl}
              alt="Uploaded content"
              width={200}
              height={200}
              className="object-cover"
            />
          </div>
        )}
        <div
          className={`px-6 py-4 rounded-2xl shadow-md backdrop-blur-sm ${
            isUser
              ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
              : "bg-white bg-opacity-90 text-gray-800 rounded-bl-none"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {message.content}
          </p>
        </div>
        {message.emotions && (
          <Card className="mt-3 w-full border border-gray-200 shadow-lg">
            <CardContent className="pt-4">
              {getTop3Emotions(message.emotions).map(([emotion, value]) => (
                <EmotionBar
                  key={emotion}
                  emotion={emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                  value={value as number}
                  color={
                    emotion === "realization"
                      ? "bg-gradient-to-r from-blue-400 to-blue-600"
                      : emotion === "calmness"
                      ? "bg-gradient-to-r from-sky-400 to-sky-600"
                      : emotion === "disappointment"
                      ? "bg-gradient-to-r from-teal-400 to-teal-600"
                      : emotion === "excitement"
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                      : emotion === "distress"
                      ? "bg-gradient-to-r from-red-400 to-red-600"
                      : emotion === "surprise"
                      ? "bg-gradient-to-r from-purple-400 to-purple-600"
                      : emotion === "amusement"
                      ? "bg-gradient-to-r from-orange-400 to-orange-600"
                      : emotion === "awkwardness"
                      ? "bg-gradient-to-r from-pink-400 to-pink-600"
                      : "bg-gradient-to-r from-blue-400 to-blue-600"
                  }
                />
              ))}
            </CardContent>
          </Card>
        )}
        {message.products && message.products.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 w-full">
            <h4 className="font-medium text-gray-700">Recommended Products:</h4>
            {message.products.map((product, idx) => (
              <ProductRecommendation key={idx} product={product} />
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
};

// Add type for supported formats
type SupportedFormats = {
  [key: string]: boolean;
};

// Add type definition for Gemini content parts
type GenerativePart = {
  text: string;
} | {
  inlineData: {
    data: string;
    mimeType: string;
  };
};

export function AiChatContent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const [supportedFormats] = useState<SupportedFormats>({
    "image/png": true,
    "image/jpeg": true,
    "image/jpg": true,
    "application/pdf": true,
    "application/msword": true,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      true,
    "text/plain": true,
    "text/markdown": true,
  });
  // Update state to include preview URLs
  const [processedDocs, setProcessedDocs] = useState<ProcessedFile[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
    }
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleEndCall = () => {
    setMessages([]);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsListening(false);
  };

  const getEmotionPrompt = (text: string) => {
    return `Analyze this message's emotions (0-1 scale):
Message: ${text}

Return only this JSON:
{"realization": 0.0, "calmness": 0.0, "disappointment": 0.0, "excitement": 0.0, "distress": 0.0, "surprise": 0.0, "amusement": 0.0, "awkwardness": 0.0, "interest": 0.0}`;
  };

  const getHealthAndFitnessPrompt = (userInput: string, fileType?: string) => {
    if (fileType?.startsWith("image/")) {
      return `You are a health, fitness, and nutrition expert. Analyze this image and provide:

If this is a food/meal image:
1. Estimated calories
2. Macro nutrients (protein, carbs, fats)
3. Health benefits
4. Any dietary concerns
5. How it fits into a fitness diet

If this is an exercise/workout image:
1. Exercise form analysis
2. Target muscle groups
3. Benefits
4. Safety tips
5. Recommended sets and reps

If this is a medicine image, provide detailed medical usage information.

Keep response under 100 words and be accurate.

For the query: ${userInput}`;
    }

    return `You are an empathetic healthcare and fitness assistant. Respond to this query: ${userInput}

Guidelines:
1. Keep responses under 75 words
2. Be empathetic and professional
3. Address both health and fitness topics including:
   - Workout routines
   - Exercise techniques
   - Nutrition advice
   - Diet plans
   - Weight management
   - General health
   - Medical concerns
4. For medicine-related questions, provide detailed usage information

If the query is not related to health or fitness, say: "I can only help with health and fitness-related questions. Please feel free to ask about those topics."`;
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onresult = async (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join(" ");
        setInputText(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (inputText.trim()) {
          handleSubmit();
        }
      };

      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const file = files[0];
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.add("border-blue-500", "bg-blue-50");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove("border-blue-500", "bg-blue-50");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragRef.current) {
      dragRef.current.classList.remove("border-blue-500", "bg-blue-50");
    }

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File ${file.name} is too large. Maximum size is 5MB`);
      return;
    }

    if (processedDocs.length >= 5) {
      alert("Maximum 5 documents allowed");
      return;
    }

    // Add type check for file.type
    if (!(file.type in supportedFormats)) {
      alert(
        "Unsupported file format. Please upload an image, PDF, or document file."
      );
      return;
    }

    setUploadProgress(0);
    try {
      const content = await extractFileContent(file);
      const processedFile: ProcessedFile = {
        name: file.name,
        type: file.type,
        content,
        originalFile: file,
      };
      setProcessedDocs((prev) => [...prev, processedFile]);
      setUploadProgress(100);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file");
    }
  };

  // Update extractFileContent function
  const extractFileContent = async (file: File): Promise<string> => {
    return `[${file.type.startsWith("image/") ? "Image" : "Document"}: ${
      file.name
    }]`;
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };
      reader.readAsText(file);
    });
  };

  const removeDocument = (index: number) => {
    setProcessedDocs((prev) => prev.filter((_, i) => i !== index));
  };

  // Add function to convert File to GenerativePart
  const fileToGenerativePart = async (file: File): Promise<GenerativePart> => {
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString("base64");
    return {
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    };
  };

  const getAIResponse = async (userInput: string) => {
    try {
      const productKeywords = [
        "buy",
        "purchase",
        "recommend",
        "suggest",
        "where to get",
        "protein powder",
        "supplements",
        "price of",
        "cost of",
        "gym equipment",
        "fitness gear",
        "workout clothes",
        "exercise machine",
        "weights",
        "resistance bands",
      ];

      const isProductQuery = productKeywords.some((keyword) =>
        userInput.toLowerCase().includes(keyword.toLowerCase())
      );

      if (isProductQuery) {
        setIsProcessing(true);

        // Extract product query
        const productQuery = userInput
          .replace(
            /can you help me buy|where can i buy|recommend me|suggest me|price of|cost of/gi,
            ""
          )
          .trim();

        // Get product recommendations
        const products = await searchAmazonProducts(productQuery);

        if (products.length > 0) {
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: `I found ${products.length} products matching "${productQuery}". Here are the details with current prices and availability:`,
            products,
            emotions: {
              interest: 0.8,
              excitement: 0.6,
              calmness: 0.7,
              realization: 0.5,
              disappointment: 0,
              distress: 0,
              surprise: 0.3,
              amusement: 0.2,
              awkwardness: 0,
            },
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setIsProcessing(false);
          return;
        }
      }

      // Continue with regular AI response if no products found
      const API_KEY =
        process.env.NEXT_PUBLIC_CHAT_API_KEY || process.env.CHAT_API_KEY;

      if (!API_KEY) {
        throw new Error(
          "API key is not configured. Please check your .env file"
        );
      }

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      let parts: GenerativePart[] = [];

      // Handle documents based on type
      if (processedDocs.length > 0) {
        const latestDoc = processedDocs[processedDocs.length - 1];
        const generativePart = await fileToGenerativePart(
          latestDoc.originalFile
        );

        if (latestDoc.type.startsWith("image/")) {
          // For images, first add the image part, then the prompt
          parts = [
            generativePart,
            { text: getHealthAndFitnessPrompt(userInput, latestDoc.type) },
          ];
        } else if (latestDoc.type === "application/pdf") {
          parts = [
            generativePart,
            {
              text: `Analyze this PDF in the context of this health/fitness query: ${userInput}`,
            },
          ];
        } else {
          parts = [
            {
              text: `Context from ${latestDoc.name}:\n${
                latestDoc.content
              }\n\n${getHealthAndFitnessPrompt(userInput)}`,
            },
          ];
        }
      } else {
        parts = [{ text: getHealthAndFitnessPrompt(userInput) }];
      }

      const [responseData, emotionData] = await Promise.all([
        model.generateContent(parts).then((result) => ({
          candidates: [
            {
              content: {
                parts: [{ text: result.response.text() }],
              },
            },
          ],
        })),
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: getEmotionPrompt(userInput) }],
                },
              ],
            }),
          }
        ).then((res) => res.json()),
      ]);

      if (!responseData?.candidates?.length) {
        throw new Error("API error occurred: No response candidates received");
      }

      const aiResponse =
        responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!aiResponse) {
        throw new Error("No response received from AI");
      }

      const cleanedResponse = cleanAIResponse(aiResponse);

      let emotions: ChatMessage["emotions"] = {
        realization: 0,
        calmness: 0,
        disappointment: 0,
        excitement: 0,
        distress: 0,
        surprise: 0,
        amusement: 0,
        awkwardness: 0,
        interest: 0,
      };

      try {
        const emotionText =
          emotionData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (emotionText) {
          // Clean up the text before parsing
          const cleanedText = emotionText
            .replace(/```json\n?/g, "") // Remove ```json
            .replace(/```/g, "") // Remove remaining backticks
            .trim(); // Remove whitespace

          console.log("Cleaned emotion text:", cleanedText);
          const parsedEmotions = JSON.parse(cleanedText);
          emotions = { ...emotions, ...parsedEmotions };
        }
      } catch (e) {
        console.error("Error parsing emotions:", e);
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: cleanedResponse,
        emotions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speakResponse(cleanedResponse);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage =
        error instanceof Error
          ? `Error: ${error.message}`
          : "I'm having trouble processing your request. Please try again.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
      speakResponse(errorMessage);
    }
  };

  const speakResponse = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      synthRef.current.speak(utterance);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    setIsProcessing(true);
    const latestDoc = processedDocs[processedDocs.length - 1];
    let imageUrl: string | undefined;

    if (latestDoc?.type.startsWith("image/")) {
      imageUrl = URL.createObjectURL(latestDoc.originalFile);
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: inputText,
      document: latestDoc,
      imageUrl: imageUrl,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    await getAIResponse(inputText);
    setIsProcessing(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg mobile:rounded-none mobile:w-full">
      <div className="p-4 border-b bg-white sticky top-0 z-10 sm:p-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 sm:text-base">
            Care Companion
          </h2>
          <p className="text-sm text-gray-500 sm:text-xs">
            Your AI Healthcare Assistant
          </p>
        </div>
      </div>

      <div
        ref={dragRef}
        className="h-[430px] overflow-y-auto p-6 bg-gray-50 relative transition-colors duration-200 sm:h-[380px] sm:p-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="relative w-24 h-24 mb-4 sm:w-20 sm:h-20">
              <Image
                src="/bot.png"
                alt="Bot Assistant"
                fill
                className="object-contain hover:scale-110 transition-all duration-300 ease-in-out"
                priority
              />
            </div>
            <p className="text-lg font-medium mb-2 sm:text-base">
              Welcome to Care Companion
            </p>
            <p className="text-sm sm:text-xs">
              Start speaking to get healthcare assistance
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="border-t bg-white">
        {processedDocs.length > 0 && (
          <div className="px-4 py-2 border-b sm:px-2 sm:py-1">
            <div className="flex flex-wrap gap-2">
              {processedDocs.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border shadow-sm sm:px-2 sm:py-1 sm:text-xs"
                >
                  {getFileIcon(doc.type)}
                  <span className="text-sm truncate max-w-[150px] sm:text-xs">
                    {doc.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors sm:w-4 sm:h-4"
                    aria-label={`Remove ${doc.name}`}
                    title={`Remove ${doc.name}`}
                  >
                    <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 mobile:p-3">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 mobile:gap-1.5 mobile:space-x-1"
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className={`h-12 w-12 mobile:h-10 mobile:w-10 rounded-full flex-shrink-0 transition-all duration-300 ${
                isListening
                  ? "bg-red-100 hover:bg-red-200 scale-110"
                  : "hover:bg-blue-100"
              }`}
              onClick={isListening ? stopListening : startListening}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? (
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75"></div>
                  <div className="absolute inset-0 rounded-full bg-red-50 animate-pulse"></div>
                  <Mic className="w-6 h-6 relative z-10 text-red-500 mobile:w-5 mobile:h-5" />
                </div>
              ) : (
                <Mic className="w-6 h-6 text-blue-500 mobile:w-5 mobile:h-5" />
              )}
            </Button>

            <div className="relative flex-1 mobile:flex-grow-0 mobile:w-[calc(100%-150px)]">
              <Input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="pr-12 h-12 text-base rounded-full border-gray-200 focus:border-blue-300 focus:ring-blue-200 mobile:h-10 mobile:text-sm mobile:px-3 mobile:pr-8"
                aria-label="Message input"
                id="message-input"
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.md"
              className="hidden"
              aria-label="Upload file"
              title="Upload file"
              id="file-upload"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full flex-shrink-0 hover:bg-gray-100 mobile:h-10 mobile:w-10"
                  disabled={documents.length >= 5}
                  aria-label="Add document"
                  title="Add document"
                >
                  <FilePlus2 className="w-5 h-5 text-gray-600 mobile:w-4 mobile:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload file
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.readText().then((text) => {
                      const file = new File([text], "clipboard.txt", {
                        type: "text/plain",
                      });
                      processFile(file);
                    })
                  }
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Paste from clipboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="submit"
              className="h-12 px-6 rounded-full bg-blue-500 hover:bg-blue-600 flex-shrink-0 mobile:h-10 mobile:px-4 mobile:text-sm"
              disabled={isProcessing || !inputText.trim()}
              aria-label="Send message"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin mobile:w-4 mobile:h-4" />
              ) : (
                <span>Send</span>
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-12 w-12 rounded-full flex-shrink-0 mobile:h-10 mobile:w-10"
                  aria-label="End call"
                  title="End call"
                >
                  <Phone className="w-4 h-4 mobile:w-3 mobile:h-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End Call</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to end this call? This will clear all
                    chat messages.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEndCall}
                    className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
                  >
                    End Call
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        </div>
      </div>
    </Card>
  );
}

export default AiChatContent;
