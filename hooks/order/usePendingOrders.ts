"use client";

import { useQuery } from "@tanstack/react-query";
import { OrdersResponse } from "@/types/order";

export function usePendingOrders() {
  return useQuery<OrdersResponse>({
    queryKey: ["admin-orders", "pending"],
    queryFn: async () => {
      const url = `/api/orders/pending`;
      const res = await fetch(url);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch pending orders");
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 1,
  });
}
