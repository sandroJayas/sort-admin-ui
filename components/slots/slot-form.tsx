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

  const getDateRange = (dates: Date[]) => {
    if (dates.length === 0) return { start: "", end: "" };

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const start = sortedDates[0].toISOString();
    const end = sortedDates[sortedDates.length - 1].toISOString();

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
                  {getDateRange(selectedDates).start} to{" "}
                  {getDateRange(selectedDates).end}
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
