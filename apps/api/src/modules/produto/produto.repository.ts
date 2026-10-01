import { Inject, Injectable } from "@nestjs/common";
import type { DatabaseClient, Prisma } from "@repo/database";
import { DATABASE_CLIENT } from "../../common/database/database.constants";
import {
  produtoDetalhadoArgs,
  type ProdutoDetalhadoPayload,
  produtoResumoArgs,
  type ProdutoResumoPayload,
} from "./types/produto.types";

type ListProdutosRepositoryParams = {
  where: Prisma.ProdutoWhereInput;
  orderBy:
    | Prisma.ProdutoOrderByWithRelationInput
    | Prisma.ProdutoOrderByWithRelationInput[];
  skip: number;
  take: number;
};

@Injectable()
export class ProdutoRepository {
  constructor(
    @Inject(DATABASE_CLIENT) private readonly database: DatabaseClient,
  ) {}

  create(data: Prisma.ProdutoCreateInput): Promise<ProdutoDetalhadoPayload> {
    return this.database.produto.create({
      data,
      ...produtoDetalhadoArgs,
    });
  }

  findMany({
    where,
    orderBy,
    skip,
    take,
  }: ListProdutosRepositoryParams): Promise<ProdutoResumoPayload[]> {
    return this.database.produto.findMany({
      where,
      orderBy,
      skip,
      take,
      ...produtoResumoArgs,
    });
  }

  count(where: Prisma.ProdutoWhereInput): Promise<number> {
    return this.database.produto.count({ where });
  }

  findById(id: string): Promise<ProdutoDetalhadoPayload | null> {
    return this.database.produto.findUnique({
      where: { id },
      ...produtoDetalhadoArgs,
    });
  }

  updateById(
    id: string,
    data: Prisma.ProdutoUpdateInput,
  ): Promise<ProdutoDetalhadoPayload> {
    return this.database.produto.update({
      where: { id },
      data,
      ...produtoDetalhadoArgs,
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.database.produto.delete({
      where: { id },
      select: { id: true },
    });
  }
}
