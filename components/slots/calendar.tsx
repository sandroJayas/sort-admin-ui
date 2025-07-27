"use client";

import type React from "react";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import UpdateSlotModal from "./update-slot-modal";
import DaySlotsModal from "./day-slots-modal";
import {
  SlotAvailabilityResponse,
  SlotResponse,
  SlotType,
  UpdateSlotRequest,
} from "@/types/slot";

interface CalendarProps {
  onSelectionChange?: (selectedDates: Date[]) => void;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  data: SlotAvailabilityResponse | undefined;
  isLoading?: boolean;
  onRefresh?: () => void;
  onUpdateSlot?: (slotId: string, data: UpdateSlotRequest) => void;
  onDeleteSlot?: (slotId: string) => void;
  isUpdatingSlot?: boolean;
  isDeletingSlot?: boolean;
}

export default function Calendar({
  onSelectionChange,
  currentDate,
  setCurrentDate,
  data,
  isLoading = false,
  onRefresh,
  onUpdateSlot,
  onDeleteSlot,
  isUpdatingSlot = false,
  isDeletingSlot = false,
}: CalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotResponse | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isDaySlotsModalOpen, setIsDaySlotsModalOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const slots = data?.slots || [];

  // Helper function to format date to YYYY-MM-DD in local timezone
  const formatDateToLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Get the first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Create array of all days to display (including previous/next month days)
  const calendarDays: (Date | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevMonthDay = new Date(firstDayOfMonth);
    prevMonthDay.setDate(prevMonthDay.getDate() - (firstDayOfWeek - i));
    calendarDays.push(prevMonthDay);
  }

  // Add all days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
    );
  }

  // Add days from next month to complete the grid (42 total cells = 6 rows × 7 days)
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      day,
    );
    calendarDays.push(nextMonthDay);
  }

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date): boolean => {
    return selectedDates.has(formatDateKey(date));
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getSlotsForDate = (date: Date): SlotResponse[] => {
    const dateStr = formatDateToLocal(date);
    return slots.filter((slot) => {
      // Parse the slot date in local timezone
      const slotDate = new Date(slot.start_time);
      const slotDateStr = formatDateToLocal(slotDate);
      return slotDateStr === dateStr;
    });
  };

  const formatTime = (isoDateTime: string): string => {
    const date = new Date(isoDateTime);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getSlotTypeColor = (slotType: SlotType): string => {
    switch (slotType) {
      case SlotType.DROPOFF:
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      case SlotType.PICKUP:
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      case SlotType.RETURN:
        return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  };

  const getSlotTypeAbbreviation = (slotType: SlotType): string => {
    switch (slotType) {
      case SlotType.DROPOFF:
        return "D";
      case SlotType.PICKUP:
        return "P";
      case SlotType.RETURN:
        return "R";
      default:
        return "?";
    }
  };

  const selectDateRange = (startDate: Date, endDate: Date) => {
    const newSelectedDates = new Set(selectedDates);
    const start = new Date(Math.min(startDate.getTime(), endDate.getTime()));
    const end = new Date(Math.max(startDate.getTime(), endDate.getTime()));

    const currentDate = new Date(start);
    while (currentDate <= end) {
      newSelectedDates.add(formatDateKey(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setSelectedDates(newSelectedDates);
    onSelectionChange?.(
      Array.from(newSelectedDates).map((key) => {
        const [year, month, day] = key.split("-").map(Number);
        return new Date(year, month, day);
      }),
    );
  };

  const handleSlotClick = (slot: SlotResponse, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent day selection
    setSelectedSlot(slot);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateModalClose = () => {
    setIsUpdateModalOpen(false);
    setSelectedSlot(null);
  };

  const handleDaySlotsModalClose = () => {
    setIsDaySlotsModalOpen(false);
    setSelectedDay(null);
  };

  const handleUpdateSlot = (slotId: string, data: UpdateSlotRequest) => {
    onUpdateSlot?.(slotId, data);
    handleUpdateModalClose();
  };

  const handleDeleteSlot = (slotId: string) => {
    onDeleteSlot?.(slotId);
    handleUpdateModalClose();
  };

  const handleDaySlotClick = (slot: SlotResponse) => {
    // Close day slots modal and open update modal
    setIsDaySlotsModalOpen(false);
    setSelectedSlot(slot);
    setIsUpdateModalOpen(true);
  };

  const handleMouseDown = (date: Date) => {
    if (!isCurrentMonth(date)) return;

    const daySlots = getSlotsForDate(date);

    // If the day has more than 3 slots, show the day slots modal
    if (daySlots.length > 3) {
      setSelectedDay(date);
      setIsDaySlotsModalOpen(true);
      return;
    }

    const dateKey = formatDateKey(date);

    // If clicking on a selected date, deselect all
    if (isSelected(date)) {
      setSelectedDates(new Set());
      onSelectionChange?.([]);
      return;
    }

    // For any new click, clear all selections and select only this date
    const newSelectedDates = new Set([dateKey]);
    setSelectedDates(newSelectedDates);
    onSelectionChange?.([date]);

    // Start drag operation
    setIsDragging(true);
    setDragStart(dateKey);
  };

  const handleMouseEnter = (date: Date) => {
    if (!isDragging || !dragStart || !isCurrentMonth(date)) return;

    const [startYear, startMonth, startDay] = dragStart.split("-").map(Number);
    const startDate = new Date(startYear, startMonth, startDay);
    selectDateRange(startDate, date);
  };

  const handleMouseUp = (date: Date) => {
    if (!isDragging || !dragStart || !isCurrentMonth(date)) {
      setIsDragging(false);
      setDragStart(null);
      return;
    }

    const [startYear, startMonth, startDay] = dragStart.split("-").map(Number);
    const startDate = new Date(startYear, startMonth, startDay);

    if (formatDateKey(startDate) !== formatDateKey(date)) {
      // Drag selection - select consecutive range
      selectDateRange(startDate, date);
    }
    // If it's the same date, selection was already handled in handleMouseDown

    setIsDragging(false);
    setDragStart(null);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);

    // Select today's date
    const todayKey = formatDateKey(today);
    setSelectedDates(new Set([todayKey]));
    onSelectionChange?.([today]);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <div className="w-full h-full bg-white border rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("prev")}
            className="h-8 w-8"
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs px-3 py-1 bg-transparent"
              disabled={isLoading}
            >
              Today
            </Button>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="text-xs px-2 py-1 bg-transparent"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            )}
            <h2 className="text-lg font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth("next")}
            className="h-8 w-8"
            disabled={isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className={`p-4 ${isLoading ? "opacity-50" : ""}`}>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div
            ref={calendarRef}
            className="grid grid-cols-7 gap-1 select-none"
            onMouseLeave={() => {
              if (isDragging) {
                setIsDragging(false);
                setDragStart(null);
              }
            }}
          >
            {calendarDays.map((date, index) => {
              if (!date) return <div key={index} />;

              const isCurrentMonthDay = isCurrentMonth(date);
              const isSelectedDay = isSelected(date);
              const isTodayDay = isToday(date);
              const daySlots = getSlotsForDate(date);

              return (
                <div
                  key={index}
                  className={`
                    min-h-24 flex flex-col p-1 cursor-pointer rounded-md transition-colors border
                    ${!isCurrentMonthDay ? "text-gray-300 cursor-not-allowed bg-gray-50" : "text-gray-900 hover:bg-gray-50 bg-white"}
                    ${isSelectedDay && isCurrentMonthDay ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                    ${isTodayDay && !isSelectedDay ? "border-gray-400 bg-gray-100" : ""}
                    ${daySlots.length > 3 ? "hover:border-purple-300" : ""}
                  `}
                  onMouseDown={() => handleMouseDown(date)}
                  onMouseEnter={() => handleMouseEnter(date)}
                  onMouseUp={() => handleMouseUp(date)}
                  title={
                    daySlots.length > 3
                      ? `Click to view all ${daySlots.length} slots`
                      : ""
                  }
                >
                  {/* Date number */}
                  <div
                    className={`text-sm font-medium mb-1 ${isTodayDay ? "font-bold" : ""}`}
                  >
                    {date.getDate()}
                  </div>

                  {/* Slots */}
                  {daySlots.length > 0 && (
                    <div className="space-y-1 flex-1 overflow-hidden">
                      {daySlots.slice(0, 3).map((slot) => (
                        <div
                          key={slot.id}
                          className={`text-xs px-1 py-0.5 rounded border z-50 cursor-pointer transition-colors ${getSlotTypeColor(slot.slot_type)}`}
                          onClick={(e) => handleSlotClick(slot, e)}
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseEnter={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                          title="Click to edit slot"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {getSlotTypeAbbreviation(slot.slot_type)}
                            </span>
                            <span className="text-xs">
                              {slot.current_capacity} / {slot.max_capacity}
                            </span>
                          </div>
                          <div className="text-xs opacity-75">
                            {formatTime(slot.start_time)}-
                            {formatTime(slot.end_time)}
                          </div>
                        </div>
                      ))}
                      {daySlots.length > 3 && (
                        <div
                          className="text-xs text-purple-600 text-center cursor-pointer hover:text-purple-800"
                          onMouseDown={(e) => e.stopPropagation()}
                          onMouseEnter={(e) => e.stopPropagation()}
                          onMouseUp={(e) => e.stopPropagation()}
                        >
                          +{daySlots.length - 3} more (click to view)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected dates info */}
        {selectedDates.size > 0 && (
          <div className="px-4 pb-4 text-sm text-gray-600">
            {selectedDates.size} day{selectedDates.size !== 1 ? "s" : ""}{" "}
            selected
          </div>
        )}
      </div>

      {/* Update Slot Modal */}
      <UpdateSlotModal
        slot={selectedSlot}
        isOpen={isUpdateModalOpen}
        onClose={handleUpdateModalClose}
        onUpdate={handleUpdateSlot}
        onDelete={handleDeleteSlot}
        isUpdating={isUpdatingSlot}
        isDeleting={isDeletingSlot}
      />

      {/* Day Slots Modal */}
      <DaySlotsModal
        date={selectedDay}
        slots={selectedDay ? getSlotsForDate(selectedDay) : []}
        isOpen={isDaySlotsModalOpen}
        onClose={handleDaySlotsModalClose}
        onSlotClick={handleDaySlotClick}
      />
    </>
  );
}
