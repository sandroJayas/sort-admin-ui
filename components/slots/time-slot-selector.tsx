"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeSlotSelectorProps {
  selectedSlots: string[];
  onSlotsChange: (slots: string[]) => void;
}

export default function TimeSlotSelector({
  selectedSlots,
  onSlotsChange,
}: TimeSlotSelectorProps) {
  const timeSlots = [
    "07:00-09:00",
    "09:00-11:00",
    "11:00-13:00",
    "13:00-15:00",
    "15:00-17:00",
    "17:00-19:00",
    "19:00-21:00",
    "21:00-23:00",
  ];

  const toggleSlot = (slot: string) => {
    const newSlots = selectedSlots.includes(slot)
      ? selectedSlots.filter((s) => s !== slot)
      : [...selectedSlots, slot];

    onSlotsChange(newSlots.sort());
  };

  const clearAll = () => {
    onSlotsChange([]);
  };

  const selectAll = () => {
    onSlotsChange([...timeSlots]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Time Slots</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearAll}>
              Clear All
            </Button>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((slot) => (
            <Button
              key={slot}
              variant={selectedSlots.includes(slot) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleSlot(slot)}
              className="text-xs"
            >
              {slot}
            </Button>
          ))}
        </div>
        {selectedSlots.length > 0 && (
          <div className="mt-3 text-xs text-gray-600">
            {selectedSlots.length} slot{selectedSlots.length !== 1 ? "s" : ""}{" "}
            selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}
