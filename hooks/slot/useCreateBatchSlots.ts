"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateBatchSlotsRequest } from "@/types/slot";

interface BatchSlotsResponse {
  slot_ids: string[];
}

export function useCreateBatchSlots() {
  const queryClient = useQueryClient();

  return useMutation<BatchSlotsResponse, Error, CreateBatchSlotsRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/storage/slots/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to create batch slots");
      }

      return responseData;
    },
    onSuccess: () => {
      // Invalidate available slots queries
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}
