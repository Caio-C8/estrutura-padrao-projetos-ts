"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  ListProdutosQueryInput,
  ListProdutosResponse,
} from "@repo/contracts";
import type { ApiError } from "@/lib/api/core/api-error";
import { browserApiClient } from "@/lib/api/browser-api-client";
import { getProdutos } from "./get-produtos";
import { produtoQueryKeys } from "./produto-query-keys";

export function useProdutos(
  query: ListProdutosQueryInput = {},
): UseQueryResult<ListProdutosResponse, ApiError> {
  return useQuery({
    queryKey: produtoQueryKeys.lista(query),

    queryFn: ({ signal }) =>
      getProdutos(browserApiClient, {
        query,
        signal,
      }),
  });
}
