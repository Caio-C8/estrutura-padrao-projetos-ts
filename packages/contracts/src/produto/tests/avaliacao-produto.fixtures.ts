export const PRODUTO_ID_AVALIADO = "875035dc-7f98-4096-b062-11b72d07c427";

export const AVALIACAO_PRODUTO_ID = "2b3251d8-a040-45a0-839f-8970b4a395cf";

export function criarAvaliacaoProdutoDetalhadaValida() {
  return {
    id: AVALIACAO_PRODUTO_ID,
    produtoId: PRODUTO_ID_AVALIADO,
    autorNome: "Maria",
    nota: 5,
    comentario: "Excelente produto.",
    recomenda: true,
    createdAt: "2026-09-27T12:00:00.000Z",
    updatedAt: "2026-09-27T13:00:00.000Z",
  };
}

export function criarAvaliacaoProdutoResumoValida() {
  const avaliacao = criarAvaliacaoProdutoDetalhadaValida();

  return {
    id: avaliacao.id,
    produtoId: avaliacao.produtoId,
    autorNome: avaliacao.autorNome,
    nota: avaliacao.nota,
    createdAt: avaliacao.createdAt,
  };
}
