"use client";

import { useQuery } from "@tanstack/react-query";
import { User } from "@/types/user";

export function useUserByEmail(email: string | null | undefined) {
  return useQuery<User | null>({
    queryKey: ["admin-user-by-email", email],
    queryFn: async () => {
      if (!email) return null;

      const res = await fetch("/api/users/by-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // Handle 404s gracefully
      if (res.status === 404) {
        return null;
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch user by email");
      }

      return res.json();
    },
    enabled: !!email, // Only run query if email is provided
    staleTime: 1000 * 60 * 5, // 5 min cache
    retry: 1,
  });
}
