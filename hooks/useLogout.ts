import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

interface LogoutResponse {
  logoutUrl?: string;
  error?: string;
}

export function useLogout() {
  const queryClient = useQueryClient();

  const logoutMutation = useMutation<
    LogoutResponse,
    Error,
    {
      clearCache?: boolean;
      redirectTo?: string;
    }
  >({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Logout request failed");
      }

      return response.json();
    },
    onSuccess: async (data, variables) => {
      // Optionally clear React Query cache
      if (variables?.clearCache !== false) {
        queryClient.clear();
      }

      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Use custom redirect or Auth0 logout URL
      const redirectUrl = variables?.redirectTo || data.logoutUrl || "/";
      window.location.href = redirectUrl;
    },
    onError: async (error, variables) => {
      console.error("Logout error:", error);

      // Still try to clear cache on error if requested
      if (variables?.clearCache !== false) {
        queryClient.clear();
      }

      // Fallback to regular signOut
      await signOut({ callbackUrl: variables?.redirectTo || "/" });
    },
  });

  return {
    logout: (options?: { clearCache?: boolean; redirectTo?: string }) =>
      logoutMutation.mutate(options || {}),
    isLoggingOut: logoutMutation.isPending,
    error: logoutMutation.error,
    reset: logoutMutation.reset,
  };
}
