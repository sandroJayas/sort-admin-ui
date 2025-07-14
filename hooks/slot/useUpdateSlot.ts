"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateSlotRequest } from "@/types/slot";

interface UpdateSlotParams {
  slotId: string;
  data: UpdateSlotRequest;
}

export function useUpdateSlot() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateSlotParams>({
    mutationFn: async ({ slotId, data }) => {
      const res = await fetch(`/api/storage/slots/${slotId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update slot");
      }
    },
    onSuccess: (_, { slotId }) => {
      // Invalidate specific slot and available slots
      queryClient.invalidateQueries({ queryKey: ["slot", slotId] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}
