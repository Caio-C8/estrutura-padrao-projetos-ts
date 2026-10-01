import type {
  CreateProdutoData,
  ListProdutosQueryData,
  UpdateProdutoData,
} from "@repo/contracts";
import type { Prisma } from "@repo/database";

function converterDataDeCalendario(data: string): Date {
  return new Date(`${data}T00:00:00.000Z`);
}

export class ProdutoPersistenceMapper {
  static toCreateInput(produto: CreateProdutoData): Prisma.ProdutoCreateInput {
    return {
      sku: produto.sku,
      nome: produto.nome,
      status: produto.status,
      emDestaque: produto.emDestaque,
      estoque: produto.estoque,
      preco: produto.preco,
      ...(produto.descricao !== undefined
        ? { descricao: produto.descricao }
        : {}),
      ...(produto.urlManual !== undefined
        ? { urlManual: produto.urlManual }
        : {}),
      ...(produto.pesoKg !== undefined ? { pesoKg: produto.pesoKg } : {}),
      ...(produto.dataValidade !== undefined
        ? {
            dataValidade: converterDataDeCalendario(produto.dataValidade),
          }
        : {}),
      ...(produto.disponivelEm !== undefined
        ? { disponivelEm: new Date(produto.disponivelEm) }
        : {}),
    };
  }

  static toUpdateInput(produto: UpdateProdutoData): Prisma.ProdutoUpdateInput {
    return {
      ...(produto.sku !== undefined ? { sku: produto.sku } : {}),
      ...(produto.nome !== undefined ? { nome: produto.nome } : {}),
      ...(produto.descricao !== undefined
        ? { descricao: produto.descricao }
        : {}),
      ...(produto.urlManual !== undefined
        ? { urlManual: produto.urlManual }
        : {}),
      ...(produto.status !== undefined ? { status: produto.status } : {}),
      ...(produto.emDestaque !== undefined
        ? { emDestaque: produto.emDestaque }
        : {}),
      ...(produto.estoque !== undefined ? { estoque: produto.estoque } : {}),
      ...(produto.preco !== undefined ? { preco: produto.preco } : {}),
      ...(produto.pesoKg !== undefined ? { pesoKg: produto.pesoKg } : {}),
      ...(produto.dataValidade !== undefined
        ? {
            dataValidade:
              produto.dataValidade === null
                ? null
                : converterDataDeCalendario(produto.dataValidade),
          }
        : {}),
      ...(produto.disponivelEm !== undefined
        ? {
            disponivelEm:
              produto.disponivelEm === null
                ? null
                : new Date(produto.disponivelEm),
          }
        : {}),
    };
  }

  static toWhere(query: ListProdutosQueryData): Prisma.ProdutoWhereInput {
    return {
      ...(query.status !== undefined ? { status: query.status } : {}),
      ...(query.emDestaque !== undefined
        ? { emDestaque: query.emDestaque }
        : {}),
      ...(query.pesquisa !== undefined
        ? {
            OR: [
              {
                sku: {
                  contains: query.pesquisa,
                  mode: "insensitive",
                },
              },
              {
                nome: {
                  contains: query.pesquisa,
                  mode: "insensitive",
                },
              },
              {
                descricao: {
                  contains: query.pesquisa,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };
  }
}
