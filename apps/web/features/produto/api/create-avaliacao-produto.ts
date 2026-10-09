import {
  AvaliacaoProdutoResponseSchema,
  CreateAvaliacaoProdutoSchema,
  type AvaliacaoProdutoResponse,
  type CreateAvaliacaoProdutoData,
  type CreateAvaliacaoProdutoInput,
  type ProdutoAvaliacoesParamsInput,
} from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient } from "@/lib/api/core/types";
import { validarProdutoAvaliacoesParams } from "./validar-avaliacao-produto-params";

export type CreateAvaliacaoProdutoOptions = Readonly<{
  produtoId: ProdutoAvaliacoesParamsInput["produtoId"];
  body: CreateAvaliacaoProdutoInput;
  signal?: AbortSignal;
}>;

function validarBody(
  body: CreateAvaliacaoProdutoInput,
): CreateAvaliacaoProdutoData {
  const resultado = CreateAvaliacaoProdutoSchema.safeParse(body);

  if (!resultado.success) {
    throw new ApiError({
      status: null,
      codigo: "DADOS_AVALIACAO_PRODUTO_INVALIDOS",
      mensagem: "Os dados informados para a avaliação são inválidos.",
      categoria: "validacao",
      erros: resultado.error.issues.map((issue) => ({
        campo: issue.path.map(String).join(".") || "avaliacao",
        codigo: "CAMPO_INVALIDO",
        mensagem: issue.message,
      })),
      cause: resultado.error,
    });
  }

  return resultado.data;
}

export async function createAvaliacaoProduto(
  apiClient: ApiClient,
  { produtoId, body, signal }: CreateAvaliacaoProdutoOptions,
): Promise<AvaliacaoProdutoResponse> {
  const params = validarProdutoAvaliacoesParams(produtoId);
  const bodyValidado = validarBody(body);

  return apiClient.request({
    path: `/produtos/${params.produtoId}/avaliacoes`,
    method: "POST",
    body: bodyValidado,
    signal,
    responseSchema: AvaliacaoProdutoResponseSchema,
  });
}
