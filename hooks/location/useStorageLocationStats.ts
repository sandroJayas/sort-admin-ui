"use client";

import { useQuery } from "@tanstack/react-query";
import { StorageLocationStats } from "@/types/storage-location";

export function useStorageLocationStats(locationId: string | undefined) {
  return useQuery<StorageLocationStats>({
    queryKey: ["storage-location-stats", locationId],
    queryFn: async () => {
      if (!locationId) {
        throw new Error("Location ID is required");
      }

      const res = await fetch(`/api/storage/locations/${locationId}/stats`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.error || "Failed to fetch storage location statistics",
        );
      }

      return res.json();
    },
    enabled: !!locationId,
    staleTime: 1000 * 60 * 2, // 2 min cache (stats change more frequently)
    retry: 1,
  });
}
