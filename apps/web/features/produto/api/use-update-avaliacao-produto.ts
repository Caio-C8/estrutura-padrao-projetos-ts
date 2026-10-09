"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type {
  AvaliacaoProdutoParamsInput,
  AvaliacaoProdutoResponse,
  UpdateAvaliacaoProdutoInput,
} from "@repo/contracts";
import { browserApiClient } from "@/lib/api/browser-api-client";
import type { ApiError } from "@/lib/api/core/api-error";
import { avaliacaoProdutoQueryKeys } from "./avaliacao-produto-query-keys";
import { updateAvaliacaoProduto } from "./update-avaliacao-produto";

export function useUpdateAvaliacaoProduto(
  produtoId: AvaliacaoProdutoParamsInput["produtoId"],
  avaliacaoId: AvaliacaoProdutoParamsInput["avaliacaoId"],
): UseMutationResult<
  AvaliacaoProdutoResponse,
  ApiError,
  UpdateAvaliacaoProdutoInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) =>
      updateAvaliacaoProduto(browserApiClient, {
        produtoId,
        avaliacaoId,
        body,
      }),

    onSuccess: async (response) => {
      queryClient.setQueryData(
        avaliacaoProdutoQueryKeys.detalhe(produtoId, avaliacaoId),
        response,
      );

      await queryClient.invalidateQueries({
        queryKey: avaliacaoProdutoQueryKeys.listas(produtoId),
      });
    },
  });
}
