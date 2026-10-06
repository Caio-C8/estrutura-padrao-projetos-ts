"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { ProdutoResponse, UpdateProdutoInput } from "@repo/contracts";
import type { ApiError } from "@/lib/api/core/api-error";
import { browserApiClient } from "@/lib/api/browser-api-client";
import { produtoQueryKeys } from "./produto-query-keys";
import { updateProduto } from "./update-produto";

export function useUpdateProduto(
  produtoId: string,
): UseMutationResult<ProdutoResponse, ApiError, UpdateProdutoInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body) =>
      updateProduto(browserApiClient, {
        produtoId,
        body,
      }),

    onSuccess: async (response) => {
      queryClient.setQueryData(produtoQueryKeys.detalhe(produtoId), response);

      await queryClient.invalidateQueries({
        queryKey: produtoQueryKeys.listas(),
      });
    },
  });
}
