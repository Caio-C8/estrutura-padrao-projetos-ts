import type { ListAvaliacoesProdutoQueryInput } from "@repo/contracts";

export const avaliacaoProdutoQueryKeys = {
  raiz: (produtoId: string) => ["produtos", produtoId, "avaliacoes"] as const,

  listas: (produtoId: string) =>
    [...avaliacaoProdutoQueryKeys.raiz(produtoId), "lista"] as const,

  lista: (produtoId: string, query: ListAvaliacoesProdutoQueryInput = {}) =>
    [
      ...avaliacaoProdutoQueryKeys.listas(produtoId),
      {
        pagina: query.pagina,
        limite: query.limite,
        pesquisa: query.pesquisa,
        recomenda: query.recomenda,
      },
    ] as const,

  detalhes: (produtoId: string) =>
    [...avaliacaoProdutoQueryKeys.raiz(produtoId), "detalhe"] as const,

  detalhe: (produtoId: string, avaliacaoId: string) =>
    [...avaliacaoProdutoQueryKeys.detalhes(produtoId), avaliacaoId] as const,
};
