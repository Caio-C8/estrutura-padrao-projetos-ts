import {
  AvaliacaoProdutoResponseSchema,
  type AvaliacaoProdutoParamsInput,
  type AvaliacaoProdutoResponse,
} from "@repo/contracts";
import type { ApiClient } from "@/lib/api/core/types";
import { validarAvaliacaoProdutoParams } from "./validar-avaliacao-produto-params";

export type GetAvaliacaoProdutoOptions = Readonly<{
  produtoId: AvaliacaoProdutoParamsInput["produtoId"];
  avaliacaoId: AvaliacaoProdutoParamsInput["avaliacaoId"];
  signal?: AbortSignal;
}>;

export async function getAvaliacaoProduto(
  apiClient: ApiClient,
  { produtoId, avaliacaoId, signal }: GetAvaliacaoProdutoOptions,
): Promise<AvaliacaoProdutoResponse> {
  const params = validarAvaliacaoProdutoParams(produtoId, avaliacaoId);

  return apiClient.request({
    path: `/produtos/${params.produtoId}/avaliacoes/${params.avaliacaoId}`,
    method: "GET",
    signal,
    responseSchema: AvaliacaoProdutoResponseSchema,
  });
}
