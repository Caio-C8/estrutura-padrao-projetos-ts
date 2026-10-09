import {
  AvaliacaoProdutoResponseSchema,
  UpdateAvaliacaoProdutoSchema,
  type AvaliacaoProdutoParamsInput,
  type AvaliacaoProdutoResponse,
  type UpdateAvaliacaoProdutoData,
  type UpdateAvaliacaoProdutoInput,
} from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient } from "@/lib/api/core/types";
import { validarAvaliacaoProdutoParams } from "./validar-avaliacao-produto-params";

export type UpdateAvaliacaoProdutoOptions = Readonly<{
  produtoId: AvaliacaoProdutoParamsInput["produtoId"];
  avaliacaoId: AvaliacaoProdutoParamsInput["avaliacaoId"];
  body: UpdateAvaliacaoProdutoInput;
  signal?: AbortSignal;
}>;

function validarBody(
  body: UpdateAvaliacaoProdutoInput,
): UpdateAvaliacaoProdutoData {
  const resultado = UpdateAvaliacaoProdutoSchema.safeParse(body);

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

export async function updateAvaliacaoProduto(
  apiClient: ApiClient,
  { produtoId, avaliacaoId, body, signal }: UpdateAvaliacaoProdutoOptions,
): Promise<AvaliacaoProdutoResponse> {
  const params = validarAvaliacaoProdutoParams(produtoId, avaliacaoId);
  const bodyValidado = validarBody(body);

  return apiClient.request({
    path: `/produtos/${params.produtoId}/avaliacoes/${params.avaliacaoId}`,
    method: "PATCH",
    body: bodyValidado,
    signal,
    responseSchema: AvaliacaoProdutoResponseSchema,
  });
}
