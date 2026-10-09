"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type {
  ListAvaliacoesProdutoQueryInput,
  ListAvaliacoesProdutoResponse,
  ProdutoAvaliacoesParamsInput,
} from "@repo/contracts";
import type { ApiError } from "@/lib/api/core/api-error";
import { browserApiClient } from "@/lib/api/browser-api-client";
import { avaliacaoProdutoQueryKeys } from "./avaliacao-produto-query-keys";
import { getAvaliacoesProduto } from "./get-avaliacoes-produto";

export function useAvaliacoesProduto(
  produtoId: ProdutoAvaliacoesParamsInput["produtoId"],
  query: ListAvaliacoesProdutoQueryInput = {},
): UseQueryResult<ListAvaliacoesProdutoResponse, ApiError> {
  return useQuery({
    queryKey: avaliacaoProdutoQueryKeys.lista(produtoId, query),

    queryFn: ({ signal }) =>
      getAvaliacoesProduto(browserApiClient, {
        produtoId,
        query,
        signal,
      }),
  });
}
