import { Inject, Injectable } from "@nestjs/common";
import type { DatabaseClient, Prisma } from "@repo/database";
import { DATABASE_CLIENT } from "../../../common/database/database.constants";
import {
  avaliacaoProdutoDetalhadoArgs,
  type AvaliacaoProdutoDetalhadoPayload,
  avaliacaoProdutoResumoArgs,
  type AvaliacaoProdutoResumoPayload,
} from "./types/avaliacao-produto.types";

type ListAvaliacoesProdutoRepositoryParams = {
  where: Prisma.AvaliacaoProdutoWhereInput;
  orderBy:
    | Prisma.AvaliacaoProdutoOrderByWithRelationInput
    | Prisma.AvaliacaoProdutoOrderByWithRelationInput[];
  skip: number;
  take: number;
};

@Injectable()
export class AvaliacaoProdutoRepository {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
  ) {}

  create(
    data: Prisma.AvaliacaoProdutoCreateInput,
  ): Promise<AvaliacaoProdutoDetalhadoPayload> {
    return this.database.avaliacaoProduto.create({
      data,
      ...avaliacaoProdutoDetalhadoArgs,
    });
  }

  findMany({
    where,
    orderBy,
    skip,
    take,
  }: ListAvaliacoesProdutoRepositoryParams): Promise<
    AvaliacaoProdutoResumoPayload[]
  > {
    return this.database.avaliacaoProduto.findMany({
      where,
      orderBy,
      skip,
      take,
      ...avaliacaoProdutoResumoArgs,
    });
  }

  count(where: Prisma.AvaliacaoProdutoWhereInput): Promise<number> {
    return this.database.avaliacaoProduto.count({ where });
  }

  findById(
    produtoId: string,
    avaliacaoId: string,
  ): Promise<AvaliacaoProdutoDetalhadoPayload | null> {
    return this.database.avaliacaoProduto.findUnique({
      where: { id: avaliacaoId, produtoId },
      ...avaliacaoProdutoDetalhadoArgs,
    });
  }

  updateById(
    produtoId: string,
    avaliacaoId: string,
    data: Prisma.AvaliacaoProdutoUpdateInput,
  ): Promise<AvaliacaoProdutoDetalhadoPayload> {
    return this.database.avaliacaoProduto.update({
      where: { id: avaliacaoId, produtoId },
      data,
      ...avaliacaoProdutoDetalhadoArgs,
    });
  }

  async deleteById(produtoId: string, avaliacaoId: string): Promise<void> {
    await this.database.avaliacaoProduto.delete({
      where: { id: avaliacaoId, produtoId },
      select: {
        id: true,
      },
    });
  }
}
