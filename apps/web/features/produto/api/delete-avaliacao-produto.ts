import type { AvaliacaoProdutoParamsInput } from "@repo/contracts";
import type { ApiClient } from "@/lib/api/core/types";
import { validarAvaliacaoProdutoParams } from "./validar-avaliacao-produto-params";

export type DeleteAvaliacaoProdutoOptions = Readonly<{
  produtoId: AvaliacaoProdutoParamsInput["produtoId"];
  avaliacaoId: AvaliacaoProdutoParamsInput["avaliacaoId"];
  signal?: AbortSignal;
}>;

export async function deleteAvaliacaoProduto(
  apiClient: ApiClient,
  { produtoId, avaliacaoId, signal }: DeleteAvaliacaoProdutoOptions,
): Promise<void> {
  const params = validarAvaliacaoProdutoParams(produtoId, avaliacaoId);

  return apiClient.request<void>({
    path: `/produtos/${params.produtoId}/avaliacoes/${params.avaliacaoId}`,
    method: "DELETE",
    signal,
  });
}
