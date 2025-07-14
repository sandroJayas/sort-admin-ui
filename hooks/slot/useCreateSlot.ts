"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateSlotRequest, SlotResponse } from "@/types/slot";

export function useCreateSlot() {
  const queryClient = useQueryClient();

  return useMutation<SlotResponse, Error, CreateSlotRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/storage/slots/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to create slot");
      }

      return responseData;
    },
    onSuccess: () => {
      // Invalidate available slots queries
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}
