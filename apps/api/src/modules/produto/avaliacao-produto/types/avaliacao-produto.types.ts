import type { Prisma } from "@repo/database";

export const avaliacaoProdutoResumoArgs = {
  select: {
    id: true,
    produtoId: true,
    autorNome: true,
    nota: true,
    createdAt: true,
  },
} satisfies Prisma.AvaliacaoProdutoDefaultArgs;

export const avaliacaoProdutoDetalhadoArgs = {
  select: {
    ...avaliacaoProdutoResumoArgs.select,
    comentario: true,
    recomenda: true,
    updatedAt: true,
  },
} satisfies Prisma.AvaliacaoProdutoDefaultArgs;

export type AvaliacaoProdutoResumoPayload = Prisma.AvaliacaoProdutoGetPayload<
  typeof avaliacaoProdutoResumoArgs
>;

export type AvaliacaoProdutoDetalhadoPayload =
  Prisma.AvaliacaoProdutoGetPayload<typeof avaliacaoProdutoDetalhadoArgs>;

export type ListAvaliacoesProdutoResult = {
  items: AvaliacaoProdutoResumoPayload[];
  total: number;
  page: number;
  lastPage: number;
  limit: number;
};
