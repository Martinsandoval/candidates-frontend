"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import { ToastProvider } from "@/app/hooks/useToast";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1 },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Theme>
        <ToastProvider>{children}</ToastProvider>
      </Theme>
    </QueryClientProvider>
  );
}
