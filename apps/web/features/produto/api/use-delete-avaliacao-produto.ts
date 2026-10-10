"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { AvaliacaoProdutoParamsInput } from "@repo/contracts";
import { browserApiClient } from "@/lib/api/browser-api-client";
import type { ApiError } from "@/lib/api/core/api-error";
import { avaliacaoProdutoQueryKeys } from "./avaliacao-produto-query-keys";
import { deleteAvaliacaoProduto } from "./delete-avaliacao-produto";

export function useDeleteAvaliacaoProduto(
  produtoId: AvaliacaoProdutoParamsInput["produtoId"],
  avaliacaoId: AvaliacaoProdutoParamsInput["avaliacaoId"],
): UseMutationResult<void, ApiError, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      deleteAvaliacaoProduto(browserApiClient, {
        produtoId,
        avaliacaoId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: avaliacaoProdutoQueryKeys.listas(produtoId),
      });
    },
  });
}
