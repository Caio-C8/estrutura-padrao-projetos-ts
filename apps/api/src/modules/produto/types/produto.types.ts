import { type Prisma } from "@repo/database";

export const produtoResumoArgs = {
  select: {
    id: true,
    sku: true,
    nome: true,
    status: true,
    emDestaque: true,
    estoque: true,
    preco: true,
    pesoKg: true,
    quantidadeVendas: true,
    dataValidade: true,
    disponivelEm: true,
    createdAt: true,
    updatedAt: true,
  },
} satisfies Prisma.ProdutoDefaultArgs;

export const produtoDetalhadoArgs = {
  select: {
    ...produtoResumoArgs.select,
    descricao: true,
    urlManual: true,
  },
} satisfies Prisma.ProdutoDefaultArgs;

export type ProdutoResumoPayload = Prisma.ProdutoGetPayload<
  typeof produtoResumoArgs
>;

export type ProdutoDetalhadoPayload = Prisma.ProdutoGetPayload<
  typeof produtoDetalhadoArgs
>;

export type ListProdutosResult = {
  items: ProdutoResumoPayload[];
  total: number;
  page: number;
  lastPage: number;
  limit: number;
};
