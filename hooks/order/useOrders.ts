"use client";

import { useQuery } from "@tanstack/react-query";
import { OrderFilterRequest, OrdersResponse } from "@/types/order";

export function useOrders({
  userId,
  filters,
}: {
  userId: string;
  filters?: OrderFilterRequest;
}) {
  // Build query params
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.order_type) params.append("order_type", filters.order_type);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("page_size", filters.limit.toString());

  return useQuery<OrdersResponse>({
    queryKey: ["admin-orders", userId, filters],
    queryFn: async () => {
      const url = params.toString()
        ? `/api/orders/user/${userId}?${params}`
        : `/api/orders/user/${userId}`;

      const res = await fetch(url);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch user orders");
      }

      return res.json();
    },
    enabled: !!userId, // Only run query if userId is provided
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 1,
  });
}
