"use client";

import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user";

export function useUser(userId: string | null | undefined) {
  return useQuery<User | null>({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      if (!userId) return null;

      const res = await fetch(`/api/users/${userId}`);

      // Handle 404s gracefully
      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch user");
      }

      return res.json();
    },
    enabled: !!userId, // Only run query if userId is provided
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 1,
  });
}
