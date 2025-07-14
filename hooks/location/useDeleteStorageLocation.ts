"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SuccessResponse } from "@/types/storage-location";

export function useDeleteStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, Error, string>({
    mutationFn: async (locationId) => {
      const res = await fetch(`/api/storage/locations/${locationId}`, {
        method: "DELETE",
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "Failed to delete storage location");
      }

      return response;
    },
    onSuccess: (_, locationId) => {
      // Remove from cache and refresh lists
      queryClient.removeQueries({ queryKey: ["storage-location", locationId] });
      queryClient.invalidateQueries({ queryKey: ["storage-locations"] });
      queryClient.invalidateQueries({
        queryKey: ["storage-locations", "available"],
      });
    },
  });
}
