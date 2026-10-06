import type { ProdutoParamsInput } from "@repo/contracts";
import type { ApiClient } from "@/lib/api/core/types";
import { validarProdutoId } from "./validar-produto-id";

export type DeleteProdutoOptions = Readonly<{
  produtoId: ProdutoParamsInput["id"];
  signal?: AbortSignal;
}>;

export async function deleteProduto(
  apiClient: ApiClient,
  { produtoId, signal }: DeleteProdutoOptions,
): Promise<void> {
  const params = validarProdutoId(produtoId);

  return apiClient.request<void>({
    path: `/produtos/${params.id}`,
    method: "DELETE",
    signal,
  });
}
