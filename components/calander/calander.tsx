import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarWithPillsProps {
  onDateSelect: (date: Date, activeMedicines: string[]) => void;
  highlightDates?: { start: Date; end: Date };
  prescriptions: Prescription[];
  selectedDate: Date;
}

interface Prescription {
  _id: string;
  medicine_names: string[];
  created_at: string;
  prescription_duration: number;
}

export function CalendarWithPills({
  onDateSelect,
  highlightDates,
  prescriptions,
  selectedDate,
}: CalendarWithPillsProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const getActiveMedicinesForDate = (date: Date) => {
    return prescriptions
      .filter((prescription) => {
        const startDate = new Date(prescription.created_at);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + prescription.prescription_duration);
        return date >= startDate && date <= endDate;
      })
      .flatMap((prescription) => prescription.medicine_names);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const activeMedicines = getActiveMedicinesForDate(newDate);
    onDateSelect(newDate, activeMedicines);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const isDateInRange = (date: Date) => {
    if (!highlightDates) return false;
    return date >= highlightDates.start && date <= highlightDates.end;
  };

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900">
          {monthName} {currentDate.getFullYear()}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-gray-900"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const isToday = new Date().toDateString() === date.toDateString();
          const isSelected = selectedDate.toDateString() === date.toDateString();
          const isHighlighted = isDateInRange(date);
          const isPrescriptionDay = getActiveMedicinesForDate(date).length > 0;

          return (
            <Button
              key={day}
              variant="ghost"
              className={cn(
                "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                isToday ? "bg-green-100 text-green-600 hover:bg-green-200" : "text-gray-900",
                isSelected ? "bg-green-500 text-white hover:bg-green-600" : "hover:bg-gray-100",
                isPrescriptionDay && !isSelected ? "bg-emerald-50 border border-emerald-200" : "",
                isHighlighted && !isSelected && !isPrescriptionDay ? "bg-green-50" : ""
              )}
              onClick={() => handleDateClick(day)}
            >
              {day}
            </Button>
          );
        })}
      </div>
    </div>
  );
}