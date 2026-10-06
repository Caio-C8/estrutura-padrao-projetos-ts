"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { CreateProdutoInput, ProdutoResponse } from "@repo/contracts";
import type { ApiError } from "@/lib/api/core/api-error";
import { browserApiClient } from "@/lib/api/browser-api-client";
import { createProduto } from "./create-produto";
import { produtoQueryKeys } from "./produto-query-keys";

export function useCreateProduto(): UseMutationResult<
  ProdutoResponse,
  ApiError,
  CreateProdutoInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) =>
      createProduto(browserApiClient, {
        body,
      }),

    onSuccess: async (response) => {
      queryClient.setQueryData(
        produtoQueryKeys.detalhe(response.dados.id),
        response,
      );

      await queryClient.invalidateQueries({
        queryKey: produtoQueryKeys.listas(),
      });
    },
  });
}
