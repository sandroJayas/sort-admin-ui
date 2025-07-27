"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TimeSlotSelector from "./time-slot-selector";
import { CreateBatchSlotsRequest, SlotType } from "@/types/slot";

interface SlotFormProps {
  selectedDates: Date[];
  onRequestChange: (request: CreateBatchSlotsRequest | null) => void;
}

export default function SlotForm({
  selectedDates,
  onRequestChange,
}: SlotFormProps) {
  const [slotType, setSlotType] = useState<SlotType>(SlotType.DROPOFF);
  const [maxCapacity, setMaxCapacity] = useState<number>(1);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  // Helper function to format date to YYYY-MM-DD at midnight local time
  const formatDateToLocalISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Create a date string at midnight local time
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const getDateRange = (dates: Date[]) => {
    if (dates.length === 0) return { start: "", end: "" };

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

    // Use local date formatting to avoid timezone shifts
    const start = formatDateToLocalISO(sortedDates[0]);

    // For the end date, if it's a single day selection, add one day
    // Otherwise use the last selected date
    let endDate: Date;
    if (sortedDates.length === 1) {
      endDate = new Date(sortedDates[0]);
      endDate.setDate(endDate.getDate() + 1);
    } else {
      endDate = sortedDates[sortedDates.length - 1];
    }

    const end = formatDateToLocalISO(endDate);

    return { start, end };
  };

  const generateRequest = (): CreateBatchSlotsRequest | null => {
    if (selectedDates.length === 0 || timeSlots.length === 0) return null;

    const { start, end } = getDateRange(selectedDates);

    return {
      slot_type: slotType,
      start_date: start,
      end_date: end,
      time_slots: timeSlots,
      max_capacity: maxCapacity,
      weekdays: [0, 1, 2, 3, 4, 5, 6],
    };
  };

  const handleSubmit = () => {
    const request = generateRequest();
    onRequestChange(request);
  };

  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const request = generateRequest();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Slot Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slot-type">Slot Type</Label>
            <Select
              value={slotType}
              onValueChange={(value) => setSlotType(value as SlotType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select slot type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SlotType.DROPOFF}>Drop-off</SelectItem>
                <SelectItem value={SlotType.PICKUP}>Pick-up</SelectItem>
                <SelectItem value={SlotType.RETURN}>Return</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-capacity">Max Capacity</Label>
            <Input
              id="max-capacity"
              type="number"
              min="1"
              value={maxCapacity}
              onChange={(e) =>
                setMaxCapacity(Number.parseInt(e.target.value) || 1)
              }
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <TimeSlotSelector
        selectedSlots={timeSlots}
        onSlotsChange={setTimeSlots}
      />

      {selectedDates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Selected Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              {selectedDates.length} day{selectedDates.length !== 1 ? "s" : ""}{" "}
              selected
              {selectedDates.length > 0 && (
                <div className="mt-1">
                  {formatDisplayDate(getDateRange(selectedDates).start)} to{" "}
                  {formatDisplayDate(getDateRange(selectedDates).end)}
                  {selectedDates.length === 1 && (
                    <span className="text-xs text-gray-500 block mt-1">
                      (Single day selection)
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {request && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Request Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
              {JSON.stringify(request, null, 2)}
            </pre>
            <Button onClick={handleSubmit} className="w-full mt-3">
              Create Batch Slots
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
