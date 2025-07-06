"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UpdateStorageLocationRequest,
  SuccessResponse,
} from "@/types/storage-location";

interface UpdateStorageLocationParams {
  locationId: string;
  data: UpdateStorageLocationRequest;
}

export function useUpdateStorageLocation() {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, Error, UpdateStorageLocationParams>({
    mutationFn: async ({ locationId, data }) => {
      const res = await fetch(`/api/storage/locations/${locationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "Failed to update storage location");
      }

      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific location and lists
      queryClient.invalidateQueries({
        queryKey: ["storage-location", variables.locationId],
      });
      queryClient.invalidateQueries({ queryKey: ["storage-locations"] });
      queryClient.invalidateQueries({
        queryKey: ["storage-locations", "available"],
      });
    },
  });
}
