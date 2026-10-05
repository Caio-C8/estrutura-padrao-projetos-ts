"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { obterQueryClient } from "@/lib/query/query-client";

type ProdutosQueryProviderProps = Readonly<{
  children: ReactNode;
}>;

export function ProdutosQueryProvider({
  children,
}: ProdutosQueryProviderProps) {
  const queryClient = obterQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
