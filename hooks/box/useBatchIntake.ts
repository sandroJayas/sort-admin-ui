"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SuccessResponse } from "@/types/user";
import { BatchIntakePayload } from "@/types/intake";

export function useBatchIntake() {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, Error, BatchIntakePayload>({
    mutationFn: async ({
      orderId,
      data,
    }: BatchIntakePayload): Promise<SuccessResponse> => {
      const response = await fetch(`/api/orders/${orderId}/intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to complete batch intake");
      }

      return result as SuccessResponse;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific order to refresh its data
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      // Invalidate order boxes since they've been updated
      queryClient.invalidateQueries({
        queryKey: ["order-boxes", variables.orderId],
      });
      // Invalidate orders list to update statuses
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      // Invalidate storage locations since capacity has changed
      queryClient.invalidateQueries({ queryKey: ["storage-locations"] });
      queryClient.invalidateQueries({
        queryKey: ["storage-locations", "available"],
      });
    },
  });
}
