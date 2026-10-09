import {
  AvaliacaoProdutoParamsSchema,
  type AvaliacaoProdutoParamsData,
  type AvaliacaoProdutoParamsInput,
  ProdutoAvaliacoesParamsSchema,
  type ProdutoAvaliacoesParamsData,
  type ProdutoAvaliacoesParamsInput,
} from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";

export function validarProdutoAvaliacoesParams(
  produtoId: ProdutoAvaliacoesParamsInput["produtoId"],
): ProdutoAvaliacoesParamsData {
  const resultado = ProdutoAvaliacoesParamsSchema.safeParse({
    produtoId,
  });

  if (!resultado.success) {
    throw new ApiError({
      status: null,
      codigo: "PRODUTO_ID_INVALIDO",
      mensagem: "O identificador informado para o produto é inválido.",
      categoria: "validacao",
      erros: resultado.error.issues.map((issue) => ({
        campo: issue.path.map(String).join(".") || "produtoId",
        codigo: "IDENTIFICADOR_INVALIDO",
        mensagem: issue.message,
      })),
      cause: resultado.error,
    });
  }

  return resultado.data;
}

export function validarAvaliacaoProdutoParams(
  produtoId: AvaliacaoProdutoParamsInput["produtoId"],
  avaliacaoId: AvaliacaoProdutoParamsInput["avaliacaoId"],
): AvaliacaoProdutoParamsData {
  const resultado = AvaliacaoProdutoParamsSchema.safeParse({
    produtoId,
    avaliacaoId,
  });

  if (!resultado.success) {
    throw new ApiError({
      status: null,
      codigo: "PARAMETROS_AVALIACAO_PRODUTO_INVALIDOS",
      mensagem: "Os identificadores informados para a avaliação são inválidos.",
      categoria: "validacao",
      erros: resultado.error.issues.map((issue) => ({
        campo: issue.path.map(String).join(".") || "parametros",
        codigo: "IDENTIFICADOR_INVALIDO",
        mensagem: issue.message,
      })),
      cause: resultado.error,
    });
  }

  return resultado.data;
}
