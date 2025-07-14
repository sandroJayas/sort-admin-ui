"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteSlot() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (slotId) => {
      const res = await fetch(`/api/storage/slots/${slotId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete slot");
      }
    },
    onSuccess: (_, slotId) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["slot", slotId] });
      queryClient.invalidateQueries({ queryKey: ["available-slots"] });
    },
  });
}
