import {
  ProdutoResponseSchema,
  UpdateProdutoSchema,
  type ProdutoParamsInput,
  type ProdutoResponse,
  type UpdateProdutoData,
  type UpdateProdutoInput,
} from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient } from "@/lib/api/core/types";
import { validarProdutoId } from "./validar-produto-id";

export type UpdateProdutoOptions = Readonly<{
  produtoId: ProdutoParamsInput["id"];
  body: UpdateProdutoInput;
  signal?: AbortSignal;
}>;

function validarBody(body: UpdateProdutoInput): UpdateProdutoData {
  const resultado = UpdateProdutoSchema.safeParse(body);

  if (!resultado.success) {
    throw new ApiError({
      status: null,
      codigo: "DADOS_PRODUTO_INVALIDOS",
      mensagem: "Os dados informados para o produto são inválidos.",
      categoria: "validacao",
      erros: resultado.error.issues.map((issue) => ({
        campo: issue.path.map(String).join(".") || "produto",
        codigo: "CAMPO_INVALIDO",
        mensagem: issue.message,
      })),
      cause: resultado.error,
    });
  }

  return resultado.data;
}

export async function updateProduto(
  apiClient: ApiClient,
  { produtoId, body, signal }: UpdateProdutoOptions,
): Promise<ProdutoResponse> {
  const params = validarProdutoId(produtoId);
  const bodyValidado = validarBody(body);

  return apiClient.request({
    path: `/produtos/${params.id}`,
    method: "PATCH",
    body: bodyValidado,
    signal,
    responseSchema: ProdutoResponseSchema,
  });
}
