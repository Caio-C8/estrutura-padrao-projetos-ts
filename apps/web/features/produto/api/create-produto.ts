import {
  CreateProdutoSchema,
  ProdutoResponseSchema,
  type CreateProdutoData,
  type CreateProdutoInput,
  type ProdutoResponse,
} from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient } from "@/lib/api/core/types";

export type CreateProdutoOptions = Readonly<{
  body: CreateProdutoInput;
  signal?: AbortSignal;
}>;

function validarBody(body: CreateProdutoInput): CreateProdutoData {
  const resultado = CreateProdutoSchema.safeParse(body);

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

export async function createProduto(
  apiClient: ApiClient,
  { body, signal }: CreateProdutoOptions,
): Promise<ProdutoResponse> {
  const bodyValidado = validarBody(body);

  return apiClient.request({
    path: "/produtos",
    method: "POST",
    body: bodyValidado,
    signal,
    responseSchema: ProdutoResponseSchema,
  });
}
