"use client";

import { useQuery } from "@tanstack/react-query";
import { StorageLocationListResponse } from "@/types/storage-location";

export function useStorageLocations() {
  return useQuery<StorageLocationListResponse>({
    queryKey: ["storage-locations"],
    queryFn: async () => {
      const res = await fetch("/api/storage/locations");

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch storage locations");
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 1,
  });
}