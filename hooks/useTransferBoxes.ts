"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TransferBoxesRequest,
  SuccessResponse,
} from "@/types/storage-location";

export function useTransferBoxes() {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, Error, TransferBoxesRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/storage/locations/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "Failed to transfer boxes");
      }

      return response;
    },
    onSuccess: () => {
      // Refresh all location-related data
      queryClient.invalidateQueries({ queryKey: ["storage-locations"] });
      queryClient.invalidateQueries({
        queryKey: ["storage-locations", "available"],
      });
      queryClient.invalidateQueries({ queryKey: ["storage-location-stats"] });
      queryClient.invalidateQueries({ queryKey: ["user-boxes"] }); // Also refresh boxes
    },
  });
}
