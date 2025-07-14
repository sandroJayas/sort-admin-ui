"use client";

import { useQuery } from "@tanstack/react-query";
import { PaginatedUsersResponse } from "@/types/user";

interface UseAdminUsersParams {
  page?: number;
  limit?: number;
}

export function useUsers({ page = 1, limit = 20 }: UseAdminUsersParams = {}) {
  return useQuery<PaginatedUsersResponse>({
    queryKey: ["admin-users", page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/users?${params}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch users");
      }

      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 1,
  });
}
