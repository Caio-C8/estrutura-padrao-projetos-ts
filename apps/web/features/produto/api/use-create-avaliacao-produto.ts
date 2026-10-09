"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type {
  AvaliacaoProdutoResponse,
  CreateAvaliacaoProdutoInput,
  ProdutoAvaliacoesParamsInput,
} from "@repo/contracts";
import type { ApiError } from "@/lib/api/core/api-error";
import { browserApiClient } from "@/lib/api/browser-api-client";
import { avaliacaoProdutoQueryKeys } from "./avaliacao-produto-query-keys";
import { createAvaliacaoProduto } from "./create-avaliacao-produto";

export function useCreateAvaliacaoProduto(
  produtoId: ProdutoAvaliacoesParamsInput["produtoId"],
): UseMutationResult<
  AvaliacaoProdutoResponse,
  ApiError,
  CreateAvaliacaoProdutoInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) =>
      createAvaliacaoProduto(browserApiClient, {
        produtoId,
        body,
      }),

    onSuccess: async (response) => {
      queryClient.setQueryData(
        avaliacaoProdutoQueryKeys.detalhe(
          response.dados.produtoId,
          response.dados.id,
        ),
        response,
      );

      await queryClient.invalidateQueries({
        queryKey: avaliacaoProdutoQueryKeys.listas(response.dados.produtoId),
      });
    },
  });
}
