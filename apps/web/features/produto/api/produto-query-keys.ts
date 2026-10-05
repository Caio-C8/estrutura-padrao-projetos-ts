import type { ListProdutosQueryInput } from "@repo/contracts";

export const produtoQueryKeys = {
  raiz: ["produtos"] as const,

  listas: () => [...produtoQueryKeys.raiz, "lista"] as const,

  lista: (query: ListProdutosQueryInput = {}) =>
    [
      ...produtoQueryKeys.listas(),
      {
        pagina: query.pagina,
        limite: query.limite,
        pesquisa: query.pesquisa,
        status: query.status,
        emDestaque: query.emDestaque,
      },
    ] as const,
};
