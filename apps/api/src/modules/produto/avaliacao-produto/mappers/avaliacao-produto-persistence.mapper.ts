import type {
  CreateAvaliacaoProdutoData,
  ListAvaliacoesProdutoQueryData,
  UpdateAvaliacaoProdutoData,
} from "@repo/contracts";
import type { Prisma } from "@repo/database";

export class AvaliacaoProdutoPersistenceMapper {
  static toCreateInput(
    produtoId: string,
    avaliacao: CreateAvaliacaoProdutoData,
  ): Prisma.AvaliacaoProdutoCreateInput {
    return {
      autorNome: avaliacao.autorNome,
      nota: avaliacao.nota,
      recomenda: avaliacao.recomenda,
      produto: {
        connect: {
          id: produtoId,
        },
      },
      ...(avaliacao.comentario !== undefined
        ? { comentario: avaliacao.comentario }
        : {}),
    };
  }

  static toUpdateInput(
    avaliacao: UpdateAvaliacaoProdutoData,
  ): Prisma.AvaliacaoProdutoUpdateInput {
    return {
      ...(avaliacao.autorNome !== undefined
        ? { autorNome: avaliacao.autorNome }
        : {}),
      ...(avaliacao.nota !== undefined ? { nota: avaliacao.nota } : {}),
      ...(avaliacao.recomenda !== undefined
        ? { recomenda: avaliacao.recomenda }
        : {}),
      ...(avaliacao.comentario !== undefined
        ? { comentario: avaliacao.comentario }
        : {}),
    };
  }

  static toWhere(
    produtoId: string,
    query: ListAvaliacoesProdutoQueryData,
  ): Prisma.AvaliacaoProdutoWhereInput {
    return {
      produtoId,
      ...(query.pesquisa !== undefined
        ? {
            autorNome: {
              contains: query.pesquisa,
              mode: "insensitive",
            },
          }
        : {}),
      ...(query.recomenda !== undefined ? { recomenda: query.recomenda } : {}),
    };
  }
}
