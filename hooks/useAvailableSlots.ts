"use client";

import { useQuery } from "@tanstack/react-query";
import {
  SlotAvailabilityRequest,
  SlotAvailabilityResponse,
} from "@/types/slot";

export function useAvailableSlots(request: SlotAvailabilityRequest) {
  return useQuery<SlotAvailabilityResponse>({
    queryKey: ["available-slots", request],
    queryFn: async () => {
      const res = await fetch("/api/storage/slots/available", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch available slots");
      }

      return res.json();
    },
    enabled: !!request.slot_type && !!request.start_date && !!request.end_date,
    staleTime: 1000 * 60 * 2, // 2 min cache - slots availability changes frequently
    retry: 1,
  });
}
