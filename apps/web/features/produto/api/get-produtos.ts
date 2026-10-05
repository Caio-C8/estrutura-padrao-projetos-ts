import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiQuery } from "@/lib/api/core/types";
import {
  type ListProdutosQueryData,
  type ListProdutosQueryInput,
  ListProdutosQuerySchema,
  type ListProdutosResponse,
  ListProdutosResponseSchema,
} from "@repo/contracts";

export type GetProdutosOptions = Readonly<{
  query?: ListProdutosQueryInput;
  signal?: AbortSignal;
}>;

function validarQuery(query: ListProdutosQueryInput): ListProdutosQueryData {
  const resultado = ListProdutosQuerySchema.safeParse(query);

  if (!resultado.success) {
    throw new ApiError({
      status: null,
      codigo: "FILTROS_PRODUTOS_INVALIDOS",
      mensagem: "Os filtros informados para a lista de produtos são inválidos.",
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

function criarApiQuery(query: ListProdutosQueryData): ApiQuery {
  return {
    pagina: query.pagina,
    limite: query.limite,
    pesquisa: query.pesquisa,
    status: query.status,
    emDestaque: query.emDestaque,
  };
}

export async function getProdutos(
  apiClient: ApiClient,
  { query = {}, signal }: GetProdutosOptions = {},
): Promise<ListProdutosResponse> {
  const queryValidada = validarQuery(query);

  return apiClient.request({
    path: "/produtos",
    method: "GET",
    query: criarApiQuery(queryValidada),
    signal,
    responseSchema: ListProdutosResponseSchema,
  });
}
