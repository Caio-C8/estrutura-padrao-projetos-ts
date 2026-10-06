"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { ApiError } from "@/lib/api/core/api-error";
import { browserApiClient } from "@/lib/api/browser-api-client";
import { deleteProduto } from "./delete-produto";
import { produtoQueryKeys } from "./produto-query-keys";

export function useDeleteProduto(
  produtoId: string,
): UseMutationResult<void, ApiError, void> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      deleteProduto(browserApiClient, {
        produtoId,
      }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: produtoQueryKeys.listas(),
      });
    },
  });
}
