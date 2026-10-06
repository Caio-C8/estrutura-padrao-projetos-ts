import {
  ProdutoParamsSchema,
  type ProdutoParamsData,
  type ProdutoParamsInput,
} from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";

export function validarProdutoId(
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
