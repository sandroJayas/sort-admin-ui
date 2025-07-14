"use client";

import { useQuery } from "@tanstack/react-query";
import { OrderResponse } from "@/types/order";

export function useOrder(orderId: string | null | undefined) {
  return useQuery<OrderResponse>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");

      const res = await fetch(`/api/orders/${orderId}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch order");
      }

      return res.json();
    },
    enabled: !!orderId, // Only run query if orderId is provided
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 1,
  });
}
