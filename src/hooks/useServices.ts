import { useQuery } from "@tanstack/react-query";
import type { ServiceResponse } from "@/types/services";

export function useServices() {
  return useQuery<ServiceResponse>({
    queryKey: ["services"],
    queryFn: async () => {
      const res = await fetch("/api/services");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch services");
      }
      return res.json();
    },
    gcTime: 30 * 60 * 1000, // Keep data in garbage collection for 30 minutes
  });
}
