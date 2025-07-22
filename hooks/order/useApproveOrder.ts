"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminApproveOrderRequest } from "@/types/operations";

type ApproveOrderPayload = {
  id: string;
  data: AdminApproveOrderRequest;
};

export function useApproveOrder() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, ApproveOrderPayload>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/orders/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "Failed to approve order");
      }

      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries after approval
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["operations"] });
    },
  });
}
