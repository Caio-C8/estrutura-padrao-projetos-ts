import {
  type ProdutoParamsData,
  type ProdutoParamsInput,
  ProdutoParamsSchema,
  type ProdutoResponse,
  ProdutoResponseSchema,
} from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient } from "@/lib/api/core/types";

export type GetProdutoOptions = Readonly<{
  produtoId: ProdutoParamsInput["id"];
  signal?: AbortSignal;
}>;

function validarProdutoId(
  produtoId: ProdutoParamsInput["id"],
): ProdutoParamsData {
  const resultado = ProdutoParamsSchema.safeParse({
    id: produtoId,
  });

  if (!resultado.success) {
    throw new ApiError({
      status: null,
      codigo: "PRODUTO_ID_INVALIDO",
      mensagem: "O identificador informado para o produto é inválido.",
      categoria: "validacao",
      erros: resultado.error.issues.map((issue) => ({
        campo: issue.path.map(String).join(".") || "id",
        codigo: "IDENTIFICADOR_INVALIDO",
        mensagem: issue.message,
      })),
      cause: resultado.error,
    });
  }

  return resultado.data;
}

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
