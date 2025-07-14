"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SuccessResponse, UpdateOrderRequest } from "@/types/order";

interface UpdateOrderPayload {
  orderId: string;
  data: UpdateOrderRequest;
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation<SuccessResponse, Error, UpdateOrderPayload>({
    mutationFn: async ({ orderId, data }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || "Failed to update order");
      }

      return responseData;
    },
    onSuccess: (_, { orderId }) => {
      // Invalidate both the specific order and orders list
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
