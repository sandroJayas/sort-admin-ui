"use client";

import { useQuery } from "@tanstack/react-query";
import { AllSlotsRequest, SlotAvailabilityResponse } from "@/types/slot";

export function useSlots(request: AllSlotsRequest) {
  return useQuery<SlotAvailabilityResponse>({
    queryKey: ["all-slots", request],
    queryFn: async () => {
      const res = await fetch("/api/storage/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch slots");
      }

      return res.json();
    },
    enabled: !!request.start_date && !!request.end_date,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
