"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SlotResponse, SlotType } from "@/types/slot";

interface DaySlotsModalProps {
  date: Date | null;
  slots: SlotResponse[];
  isOpen: boolean;
  onClose: () => void;
  onSlotClick: (slot: SlotResponse) => void;
}

export default function DaySlotsModal({
  date,
  slots,
  isOpen,
  onClose,
  onSlotClick,
}: DaySlotsModalProps) {
  const formatTime = (isoDateTime: string): string => {
    const date = new Date(isoDateTime);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSlotTypeColor = (slotType: SlotType): string => {
    switch (slotType) {
      case SlotType.DROPOFF:
        return "bg-green-100 text-green-800 border-green-200";
      case SlotType.PICKUP:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case SlotType.RETURN:
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSlotTypeLabel = (slotType: SlotType): string => {
    switch (slotType) {
      case SlotType.DROPOFF:
        return "Drop-off";
      case SlotType.PICKUP:
        return "Pick-up";
      case SlotType.RETURN:
        return "Return";
      default:
        return "Unknown";
    }
  };

  // Sort slots by start time
  const sortedSlots = [...slots].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
  );

  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Slots for {formatDate(date)}</DialogTitle>
          <DialogDescription>
            {slots.length} slot{slots.length !== 1 ? "s" : ""} available on this
            day. Click on any slot to edit it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {sortedSlots.map((slot) => (
            <div
              key={slot.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors hover:shadow-md ${getSlotTypeColor(slot.slot_type)} hover:opacity-80`}
              onClick={() => onSlotClick(slot)}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className={getSlotTypeColor(slot.slot_type)}>
                  {getSlotTypeLabel(slot.slot_type)}
                </Badge>
                <span className="text-sm font-medium">
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Capacity:</span>
                  <span className="ml-2 font-medium">
                    {slot.current_capacity} / {slot.max_capacity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Available:</span>
                  <span className="ml-2 font-medium">
                    {slot.available_capacity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`ml-2 font-medium ${slot.is_available ? "text-green-600" : "text-red-600"}`}
                  >
                    {slot.is_available ? "Available" : "Full"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">ID:</span>
                  <span className="ml-2 text-xs font-mono">
                    {slot.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
