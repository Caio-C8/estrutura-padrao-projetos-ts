import {
  AvaliacaoProdutoResponseSchema,
  ListAvaliacoesProdutoResponseSchema,
  type AvaliacaoProdutoDetalhadoResponse,
  type AvaliacaoProdutoResponse,
  type AvaliacaoProdutoResumoResponse,
  type ListAvaliacoesProdutoResponse,
} from "@repo/contracts";
import { PRODUTO_NOTEBOOK_ID } from "./produtos";

export const AVALIACAO_MARIA_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

export const AVALIACAO_JOAO_ID = "875035dc-7f98-4096-b062-11b72d07c427";

export const AVALIACAO_MARIA = {
  id: AVALIACAO_MARIA_ID,
  produtoId: PRODUTO_NOTEBOOK_ID,
  autorNome: "Maria",
  nota: 5,
  comentario: "Produto excelente.",
  recomenda: true,
  createdAt: "2026-10-08T10:00:00.000Z",
  updatedAt: "2026-10-08T10:00:00.000Z",
} satisfies AvaliacaoProdutoDetalhadoResponse;

export const AVALIACAO_MARIA_RESUMO = {
  id: AVALIACAO_MARIA.id,
  produtoId: AVALIACAO_MARIA.produtoId,
  autorNome: AVALIACAO_MARIA.autorNome,
  nota: AVALIACAO_MARIA.nota,
  createdAt: AVALIACAO_MARIA.createdAt,
} satisfies AvaliacaoProdutoResumoResponse;

export const AVALIACAO_JOAO = {
  id: AVALIACAO_JOAO_ID,
  produtoId: PRODUTO_NOTEBOOK_ID,
  autorNome: "João E2E",
  nota: 5,
  comentario: "Ótimo produto para uso diário.",
  recomenda: true,
  createdAt: "2026-10-12T12:00:00.000Z",
  updatedAt: "2026-10-12T12:00:00.000Z",
} satisfies AvaliacaoProdutoDetalhadoResponse;

export const AVALIACAO_JOAO_ATUALIZADA = {
  ...AVALIACAO_JOAO,
  nota: 4,
  updatedAt: "2026-10-12T13:00:00.000Z",
} satisfies AvaliacaoProdutoDetalhadoResponse;

export const AVALIACAO_JOAO_RESUMO = {
  id: AVALIACAO_JOAO.id,
  produtoId: AVALIACAO_JOAO.produtoId,
  autorNome: AVALIACAO_JOAO.autorNome,
  nota: AVALIACAO_JOAO.nota,
  createdAt: AVALIACAO_JOAO.createdAt,
} satisfies AvaliacaoProdutoResumoResponse;

type CreateListAvaliacoesProdutoResponseOptions = Readonly<{
  dados?: readonly AvaliacaoProdutoResumoResponse[];
  total?: number;
  pagina?: number;
  limite?: number;
}>;

export function createListAvaliacoesProdutoResponse({
  dados = [AVALIACAO_MARIA_RESUMO],
  total = dados.length,
  pagina = 1,
  limite = 20,
}: CreateListAvaliacoesProdutoResponseOptions = {}): ListAvaliacoesProdutoResponse {
  return ListAvaliacoesProdutoResponseSchema.parse({
    status: 200,
    sucesso: true,
    mensagem: "Avaliações listadas com sucesso.",
    dados: [...dados],
    meta: {
      total,
      pagina,
      ultimaPagina: Math.max(1, Math.ceil(total / limite)),
      limite,
    },
  });
}

type CreateAvaliacaoProdutoResponseOptions = Readonly<{
  avaliacao?: AvaliacaoProdutoDetalhadoResponse;
  status?: number;
  mensagem?: string;
}>;

export function createAvaliacaoProdutoResponse({
  avaliacao = AVALIACAO_MARIA,
  status = 200,
  mensagem = "Avaliação consultada com sucesso.",
}: CreateAvaliacaoProdutoResponseOptions = {}): AvaliacaoProdutoResponse {
  return AvaliacaoProdutoResponseSchema.parse({
    status,
    sucesso: true,
    mensagem,
    dados: avaliacao,
  });
}
