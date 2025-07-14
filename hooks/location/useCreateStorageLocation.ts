"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateStorageLocationRequest,
  StorageLocation,
} from "@/types/storage-location";

export function useCreateStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation<StorageLocation, Error, CreateStorageLocationRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/storage/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "Failed to create storage location");
      }

      return response;
    },
    onSuccess: () => {
      // Invalidate both lists to refresh the data
      queryClient.invalidateQueries({ queryKey: ["storage-locations"] });
      queryClient.invalidateQueries({
        queryKey: ["storage-locations", "available"],
      });
    },
  });
}
