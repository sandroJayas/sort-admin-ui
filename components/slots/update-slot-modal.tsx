"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { SlotResponse, SlotType, UpdateSlotRequest } from "@/types/slot";

interface UpdateSlotModalProps {
  slot: SlotResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (slotId: string, data: UpdateSlotRequest) => void;
  onDelete: (slotId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function UpdateSlotModal({
  slot,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
}: UpdateSlotModalProps) {
  const [maxCapacity, setMaxCapacity] = useState<number>(
    slot?.max_capacity || 1,
  );

  // Update local state when slot changes
  useState(() => {
    if (slot) {
      setMaxCapacity(slot.max_capacity);
    }
  });

  const formatTime = (isoDateTime: string): string => {
    const date = new Date(isoDateTime);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (isoDateTime: string): string => {
    const date = new Date(isoDateTime);
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
        return "bg-green-100 text-green-800";
      case SlotType.PICKUP:
        return "bg-blue-100 text-blue-800";
      case SlotType.RETURN:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  const handleUpdate = () => {
    if (!slot) return;

    const updateData: UpdateSlotRequest = {};

    // Only include changed fields
    if (maxCapacity !== slot.max_capacity) {
      updateData.max_capacity = maxCapacity;
    }

    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      onUpdate(slot.id, updateData);
    } else {
      onClose();
    }
  };

  const handleDelete = () => {
    if (!slot) return;
    onDelete(slot.id);
  };

  const hasChanges = slot && maxCapacity !== slot.max_capacity;

  if (!slot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Slot</DialogTitle>
          <DialogDescription>
            Modify the slot details or delete the slot entirely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Slot Information */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Type</span>
              <Badge className={getSlotTypeColor(slot.slot_type)}>
                {getSlotTypeLabel(slot.slot_type)}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Date</span>
              <span className="text-sm">{formatDate(slot.start_time)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Time</span>
              <span className="text-sm">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Current Bookings
              </span>
              <span className="text-sm font-medium">
                {slot.current_capacity} / {slot.max_capacity}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Available
              </span>
              <span
                className={`text-sm font-medium ${slot.is_available ? "text-green-600" : "text-red-600"}`}
              >
                {slot.is_available ? "Yes" : "No"}
              </span>
            </div>
          </div>

          {/* Editable Fields */}
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
              disabled={isUpdating}
            />
            <p className="text-xs text-gray-500">
              Current bookings: {slot.current_capacity}. Cannot set below
              current bookings.
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Slot"}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUpdating || isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                !hasChanges ||
                isUpdating ||
                isDeleting ||
                maxCapacity < slot.current_capacity
              }
            >
              {isUpdating ? "Updating..." : "Update Slot"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
