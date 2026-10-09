import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiQuery } from "@/lib/api/core/types";
import {
  type ListAvaliacoesProdutoQueryData,
  type ListAvaliacoesProdutoQueryInput,
  ListAvaliacoesProdutoQuerySchema,
  type ListAvaliacoesProdutoResponse,
  ListAvaliacoesProdutoResponseSchema,
  type ProdutoAvaliacoesParamsInput,
} from "@repo/contracts";
import { validarProdutoAvaliacoesParams } from "./validar-avaliacao-produto-params";

export type GetAvaliacoesProdutoOptions = Readonly<{
  produtoId: ProdutoAvaliacoesParamsInput["produtoId"];
  query?: ListAvaliacoesProdutoQueryInput;
  signal?: AbortSignal;
}>;

function validarQuery(
  query: ListAvaliacoesProdutoQueryInput,
): ListAvaliacoesProdutoQueryData {
  const resultado = ListAvaliacoesProdutoQuerySchema.safeParse(query);

  if (!resultado.success) {
    throw new ApiError({
      status: null,
      codigo: "FILTROS_AVALIACOES_PRODUTO_INVALIDOS",
      mensagem:
        "Os filtros informados para a lista de avaliações são inválidos.",
      categoria: "validacao",
      erros: resultado.error.issues.map((issue) => ({
        campo: issue.path.map(String).join(".") || "filtros",
        codigo: "FILTRO_INVALIDO",
        mensagem: issue.message,
      })),
      cause: resultado.error,
    });
  }

  return resultado.data;
}

function criarApiQuery(query: ListAvaliacoesProdutoQueryData): ApiQuery {
  return {
    pagina: query.pagina,
    limite: query.limite,
    pesquisa: query.pesquisa,
    recomenda: query.recomenda,
  };
}

export async function getAvaliacoesProduto(
  apiClient: ApiClient,
  { produtoId, query = {}, signal }: GetAvaliacoesProdutoOptions,
): Promise<ListAvaliacoesProdutoResponse> {
  const params = validarProdutoAvaliacoesParams(produtoId);
  const queryValidada = validarQuery(query);

  return apiClient.request({
    path: `/produtos/${params.produtoId}/avaliacoes`,
    method: "GET",
    query: criarApiQuery(queryValidada),
    signal,
    responseSchema: ListAvaliacoesProdutoResponseSchema,
  });
}
