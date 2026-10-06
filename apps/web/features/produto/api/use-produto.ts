"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ProdutoParamsSchema, type ProdutoResponse } from "@repo/contracts";
import type { ApiError } from "@/lib/api/core/api-error";
import { browserApiClient } from "@/lib/api/browser-api-client";
import { getProduto } from "./get-produto";
import { produtoQueryKeys } from "./produto-query-keys";

export function useProduto(
  produtoId: string,
): UseQueryResult<ProdutoResponse, ApiError> {
  const produtoIdValido = ProdutoParamsSchema.safeParse({
    id: produtoId,
  }).success;

  return useQuery({
    queryKey: produtoQueryKeys.detalhe(produtoId),

    queryFn: ({ signal }) =>
      getProduto(browserApiClient, {
        produtoId,
        signal,
      }),

    enabled: produtoIdValido,
  });
}
