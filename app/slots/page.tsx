"use client";

import { useMemo, useState } from "react";
import Layout from "@/components/kokonutui/layout";
import type {
  CreateBatchSlotsRequest,
  UpdateSlotRequest,
  AllSlotsRequest,
} from "@/types/slot";
import Calendar from "@/components/slots/calendar";
import SlotForm from "@/components/slots/slot-form";
import { useCreateBatchSlots } from "@/hooks/slot/useCreateBatchSlots";
import { useUpdateSlot } from "@/hooks/slot/useUpdateSlot";
import { useDeleteSlot } from "@/hooks/slot/useDeleteSlot";
import { toast } from "sonner";
import { useSlots } from "@/hooks/slot/useSlots";

const Page = () => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { mutate: createBatchSlots } = useCreateBatchSlots();
  const { mutate: updateSlot, isPending: isUpdatingSlot } = useUpdateSlot();
  const { mutate: deleteSlot, isPending: isDeletingSlot } = useDeleteSlot();

  const handleSelectionChange = (dates: Date[]) => {
    setSelectedDates(dates);
  };

  // Helper function to create a date at midnight in local timezone as ISO string
  const createLocalMidnightISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Create a date string at midnight local time
    // Using T00:00:00.000Z format expected by backend
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  // Calculate the date range for the current calendar view
  const dateRange = useMemo((): AllSlotsRequest => {
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    // Calculate the first visible date (including previous month overflow)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    // Calculate the last visible date (6 rows × 7 days = 42 days total)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 42 days - 1 (since we start from day 0)

    return {
      start_date: createLocalMidnightISO(startDate),
      end_date: createLocalMidnightISO(endDate),
    };
  }, [currentDate]);

  // Fetch slots for the current date range
  const { data, refetch, isLoading } = useSlots(dateRange);

  const handleRequestChange = (request: CreateBatchSlotsRequest | null) => {
    if (request) {
      createBatchSlots(request, {
        onSuccess: () => {
          toast.success("Slots created successfully");
          refetch();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    }
  };

  const handleUpdateSlot = (slotId: string, updateData: UpdateSlotRequest) => {
    updateSlot(
      { slotId, data: updateData },
      {
        onSuccess: () => {
          toast.success("Slot updated successfully");
          refetch();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update slot");
        },
      },
    );
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteSlot(slotId, {
      onSuccess: () => {
        toast.success("Slot deleted successfully");
        refetch();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete slot");
      },
    });
  };

  return (
    <Layout page={"slots"}>
      <div className="flex gap-4 p-4">
        <div className="flex-1">
          <Calendar
            onSelectionChange={handleSelectionChange}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            data={data}
            isLoading={isLoading}
            onRefresh={refetch}
            onUpdateSlot={handleUpdateSlot}
            onDeleteSlot={handleDeleteSlot}
            isUpdatingSlot={isUpdatingSlot}
            isDeletingSlot={isDeletingSlot}
          />
        </div>
        <div className="w-80 overflow-y-auto">
          <SlotForm
            selectedDates={selectedDates}
            onRequestChange={handleRequestChange}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Page;
