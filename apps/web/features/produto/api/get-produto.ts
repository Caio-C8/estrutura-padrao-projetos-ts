import {
  ProdutoResponseSchema,
  type ProdutoParamsInput,
  type ProdutoResponse,
} from "@repo/contracts";
import type { ApiClient } from "@/lib/api/core/types";
import { validarProdutoId } from "./validar-produto-id";

export type GetProdutoOptions = Readonly<{
  produtoId: ProdutoParamsInput["id"];
  signal?: AbortSignal;
}>;

export async function getProduto(
  apiClient: ApiClient,
  { produtoId, signal }: GetProdutoOptions,
): Promise<ProdutoResponse> {
  const params = validarProdutoId(produtoId);

  return apiClient.request({
    path: `/produtos/${params.id}`,
    method: "GET",
    signal,
    responseSchema: ProdutoResponseSchema,
  });
}
