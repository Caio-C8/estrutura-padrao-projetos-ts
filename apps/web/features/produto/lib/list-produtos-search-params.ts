import {
  ListProdutosQuerySchema,
  type ErroCampo,
  type ListProdutosQueryData,
  type ListProdutosQueryInput,
} from "@repo/contracts";

export type ProdutosSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type ProdutosFiltrosValores = Readonly<{
  pesquisa: string;
  status: string;
  emDestaque: string;
  limite: string;
}>;

type ResultadoProdutosSearchParams =
  | {
      sucesso: true;
      query: ListProdutosQueryInput;
      valores: ProdutosFiltrosValores;
    }
  | {
      sucesso: false;
      erros: ErroCampo[];
      valores: ProdutosFiltrosValores;
    };

export const LIMITES_PRODUTOS_POR_PAGINA = ["10", "20", "50"] as const;

function criarValoresInformados(
  searchParams: ProdutosSearchParams,
): ProdutosFiltrosValores {
  return {
    pesquisa: valorDoFormulario(searchParams.pesquisa),
    status: valorDoFormulario(searchParams.status),
    emDestaque: valorDoFormulario(searchParams.emDestaque),
    limite: valorDoFormulario(searchParams.limite, "20"),
  };
}

function limiteRepresentadoPelaInterface(limite: number): boolean {
  const limiteTextual = String(limite);

  return LIMITES_PRODUTOS_POR_PAGINA.some(
    (limitePermitido) => limitePermitido === limiteTextual,
  );
}

function valorDoFormulario(
  valor: string | string[] | undefined,
  padrao = "",
): string {
  if (valor === undefined) {
    return padrao;
  }

  return typeof valor === "string" ? valor : "";
}

function criarQueryCanonica(
  query: ListProdutosQueryData,
): ListProdutosQueryInput {
  return {
    pagina: String(query.pagina),
    limite: String(query.limite),
    pesquisa: query.pesquisa,
    status: query.status,
    emDestaque:
      query.emDestaque === undefined ? undefined : String(query.emDestaque),
  };
}

function criarValoresCanonicos(
  query: ListProdutosQueryInput,
): ProdutosFiltrosValores {
  return {
    pesquisa: query.pesquisa ?? "",
    status: query.status ?? "",
    emDestaque: query.emDestaque ?? "",
    limite: query.limite ?? "20",
  };
}

function normalizarFiltroOpcional(
  valor: string | string[] | undefined,
): string | string[] | undefined {
  return valor === "" ? undefined : valor;
}

export function lerProdutosSearchParams(
  searchParams: ProdutosSearchParams,
): ResultadoProdutosSearchParams {
  const entrada = {
    pagina: searchParams.pagina,
    limite: searchParams.limite,
    pesquisa: normalizarFiltroOpcional(searchParams.pesquisa),
    status: normalizarFiltroOpcional(searchParams.status),
    emDestaque: normalizarFiltroOpcional(searchParams.emDestaque),
  };

  const resultado = ListProdutosQuerySchema.safeParse(entrada);

  if (!resultado.success) {
    return {
      sucesso: false,
      valores: criarValoresInformados(searchParams),
      erros: resultado.error.issues.map((issue) => ({
        campo: issue.path.map(String).join(".") || "filtros",
        codigo: "FILTRO_URL_INVALIDO",
        mensagem: issue.message,
      })),
    };
  }

  if (!limiteRepresentadoPelaInterface(resultado.data.limite)) {
    return {
      sucesso: false,
      valores: criarValoresInformados(searchParams),
      erros: [
        {
          campo: "limite",
          codigo: "FILTRO_URL_INVALIDO",
          mensagem: "Selecione 10, 20 ou 50 itens por página.",
        },
      ],
    };
  }

  const query = criarQueryCanonica(resultado.data);

  return {
    sucesso: true,
    query,
    valores: criarValoresCanonicos(query),
  };
}
