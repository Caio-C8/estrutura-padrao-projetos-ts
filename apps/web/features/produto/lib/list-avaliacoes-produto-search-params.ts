import {
  ListAvaliacoesProdutoQuerySchema,
  type ListAvaliacoesProdutoQueryInput,
} from "@repo/contracts";

export const LIMITES_AVALIACOES_PRODUTO = [10, 20, 50] as const;

type SearchParamValue = string | string[] | undefined;

export type AvaliacoesProdutoSearchParams = Readonly<
  Record<string, SearchParamValue>
>;

export type AvaliacoesProdutoFiltrosValores = Readonly<{
  pagina: string;
  limite: string;
  pesquisa: string;
  recomenda: string;
}>;

export type ErroFiltroAvaliacoesProduto = Readonly<{
  campo: string;
  codigo: "FILTRO_INVALIDO";
  mensagem: string;
}>;

export type ResultadoAvaliacoesProdutoSearchParams =
  | Readonly<{
      sucesso: true;
      valores: AvaliacoesProdutoFiltrosValores;
      query: ListAvaliacoesProdutoQueryInput;
    }>
  | Readonly<{
      sucesso: false;
      valores: AvaliacoesProdutoFiltrosValores;
      erros: readonly ErroFiltroAvaliacoesProduto[];
    }>;

function obterValorVisivel(valor: SearchParamValue, fallback: string): string {
  if (Array.isArray(valor)) {
    return valor[0] ?? fallback;
  }

  return valor ?? fallback;
}

function normalizarFiltroOpcional(valor: SearchParamValue): SearchParamValue {
  if (valor === "") {
    return undefined;
  }

  return valor;
}

export function lerAvaliacoesProdutoSearchParams(
  searchParams: AvaliacoesProdutoSearchParams,
): ResultadoAvaliacoesProdutoSearchParams {
  const valoresRecebidos: AvaliacoesProdutoFiltrosValores = {
    pagina: obterValorVisivel(searchParams.pagina, "1"),
    limite: obterValorVisivel(searchParams.limite, "20"),
    pesquisa: obterValorVisivel(searchParams.pesquisa, ""),
    recomenda: obterValorVisivel(searchParams.recomenda, ""),
  };

  const resultado = ListAvaliacoesProdutoQuerySchema.safeParse({
    pagina: searchParams.pagina ?? "1",
    limite: searchParams.limite ?? "20",
    pesquisa: normalizarFiltroOpcional(searchParams.pesquisa),
    recomenda: normalizarFiltroOpcional(searchParams.recomenda),
  });

  if (!resultado.success) {
    return {
      sucesso: false,
      valores: valoresRecebidos,
      erros: resultado.error.issues.map((issue) => ({
        campo: issue.path.map(String).join(".") || "filtros",
        codigo: "FILTRO_INVALIDO",
        mensagem: issue.message,
      })),
    };
  }

  const limiteDisponivelNaInterface = LIMITES_AVALIACOES_PRODUTO.some(
    (limite) => limite === resultado.data.limite,
  );

  if (!limiteDisponivelNaInterface) {
    return {
      sucesso: false,
      valores: valoresRecebidos,
      erros: [
        {
          campo: "limite",
          codigo: "FILTRO_INVALIDO",
          mensagem: "Selecione 10, 20 ou 50 avaliações por página.",
        },
      ],
    };
  }

  const query: ListAvaliacoesProdutoQueryInput = {
    pagina: String(resultado.data.pagina),
    limite: String(resultado.data.limite),
    pesquisa: resultado.data.pesquisa,
    recomenda:
      resultado.data.recomenda === undefined
        ? undefined
        : resultado.data.recomenda
          ? "true"
          : "false",
  };

  return {
    sucesso: true,
    valores: {
      pagina: query.pagina ?? "1",
      limite: query.limite ?? "20",
      pesquisa: query.pesquisa ?? "",
      recomenda: query.recomenda ?? "",
    },
    query,
  };
}
