import { Pill, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PillReminderProps {
  pillName: string;
  date: string;
  day: string;
  className?: string;
  isTaken: boolean;
  onTakePill: () => void;
}

const MORNING_TIME = {
  start: 6,
  end: 11,
};

export default function PillReminderCard({
  pillName,
  date,
  day,
  className = "",
  isTaken,
  onTakePill,
}: PillReminderProps) {
  const isInMorningWindow = () => {
    const hour = new Date().getHours();
    return hour >= MORNING_TIME.start && hour <= MORNING_TIME.end;
  };

  function cn(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <Card className={`w-full max-w-md bg-white shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Pill className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {pillName}
              </h3>
              <Badge
                variant={isInMorningWindow() ? "default" : "secondary"}
                className="mt-1 text-sm font-medium"
              >
                Morning
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">{date}</p>
            <p className="text-xs text-gray-400 mt-1">{day}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full",
              isTaken
                ? "bg-green-50 border-green-200"
                : "border-green-200 hover:border-green-300 hover:bg-green-50"
            )}
            onClick={onTakePill}
            disabled={isTaken || !isInMorningWindow()}
          >
            <Check className="w-4 h-4 text-green-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
