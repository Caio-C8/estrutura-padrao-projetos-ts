"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  AvaliacaoProdutoParamsSchema,
  type AvaliacaoProdutoParamsInput,
  type AvaliacaoProdutoResponse,
} from "@repo/contracts";
import type { ApiError } from "@/lib/api/core/api-error";
import { browserApiClient } from "@/lib/api/browser-api-client";
import { avaliacaoProdutoQueryKeys } from "./avaliacao-produto-query-keys";
import { getAvaliacaoProduto } from "./get-avaliacao-produto";

export function useAvaliacaoProduto(
  produtoId: AvaliacaoProdutoParamsInput["produtoId"],
  avaliacaoId: AvaliacaoProdutoParamsInput["avaliacaoId"],
): UseQueryResult<AvaliacaoProdutoResponse, ApiError> {
  const parametrosValidos = AvaliacaoProdutoParamsSchema.safeParse({
    produtoId,
    avaliacaoId,
  }).success;

  return useQuery({
    queryKey: avaliacaoProdutoQueryKeys.detalhe(produtoId, avaliacaoId),

    queryFn: ({ signal }) =>
      getAvaliacaoProduto(browserApiClient, {
        produtoId,
        avaliacaoId,
        signal,
      }),

    enabled: parametrosValidos,
  });
}
