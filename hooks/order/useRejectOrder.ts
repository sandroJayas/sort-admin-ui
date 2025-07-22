"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminRejectOrderRequest } from "@/types/operations";

type RejectOrderPayload = {
  id: string;
  data: AdminRejectOrderRequest;
};

export function useRejectOrder() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, RejectOrderPayload>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/orders/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || "Failed to reject order");
      }

      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["operations"] });
    },
  });
}
