import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@repo/database";
import { ProdutoRepository } from "./produto.repository";
import {
  CreateProdutoData,
  ListProdutosQueryData,
  UpdateProdutoData,
} from "@repo/contracts";
import {
  ListProdutosResult,
  ProdutoDetalhadoPayload,
} from "./types/produto.types";
import { ProdutoPersistenceMapper } from "./mappers/produto-persistence.mapper";

const PRODUTOS_ORDER_BY = [
  { createdAt: "desc" },
  { id: "desc" },
] satisfies Prisma.ProdutoOrderByWithRelationInput[];

@Injectable()
export class ProdutoService {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async create(produto: CreateProdutoData): Promise<ProdutoDetalhadoPayload> {
    try {
      return await this.produtoRepository.create(
        ProdutoPersistenceMapper.toCreateInput(produto),
      );
    } catch (erro: unknown) {
      return this.lancarErroDePersistencia(erro);
    }
  }

  async list(query: ListProdutosQueryData): Promise<ListProdutosResult> {
    const where = ProdutoPersistenceMapper.toWhere(query);
    const skip = (query.pagina - 1) * query.limite;

    const [items, total] = await Promise.all([
      this.produtoRepository.findMany({
        where,
        orderBy: PRODUTOS_ORDER_BY,
        skip,
        take: query.limite,
      }),
      this.produtoRepository.count(where),
    ]);

    return {
      items,
      total,
      page: query.pagina,
      lastPage: Math.max(1, Math.ceil(total / query.limite)),
      limit: query.limite,
    };
  }

  async findById(id: string): Promise<ProdutoDetalhadoPayload> {
    const produto = await this.produtoRepository.findById(id);

    if (!produto) {
      throw this.criarErroProdutoNaoEncontrado();
    }

    return produto;
  }

  async updateById(
    id: string,
    produto: UpdateProdutoData,
  ): Promise<ProdutoDetalhadoPayload> {
    try {
      return await this.produtoRepository.updateById(
        id,
        ProdutoPersistenceMapper.toUpdateInput(produto),
      );
    } catch (erro: unknown) {
      return this.lancarErroDePersistencia(erro);
    }
  }

  async deleteById(id: string): Promise<void> {
    try {
      await this.produtoRepository.deleteById(id);
    } catch (erro: unknown) {
      this.lancarErroDePersistencia(erro);
    }
  }

  private lancarErroDePersistencia(erro: unknown): never {
    if (erro instanceof Prisma.PrismaClientKnownRequestError) {
      if (erro.code === "P2002") {
        throw this.criarErroSkuDuplicado();
      }

      if (erro.code === "P2025") {
        throw this.criarErroProdutoNaoEncontrado();
      }
    }

    throw erro;
  }

  private criarErroSkuDuplicado(): ConflictException {
    return new ConflictException({
      codigo: "SKU_PRODUTO_JA_EXISTENTE",
      mensagem: "Já existe um produto com o SKU informado.",
      erros: [
        {
          campo: "sku",
          codigo: "VALOR_JA_EXISTENTE",
          mensagem: "Já existe um produto com este SKU.",
        },
      ],
    });
  }

  private criarErroProdutoNaoEncontrado(): NotFoundException {
    return new NotFoundException({
      codigo: "PRODUTO_NAO_ENCONTRADO",
      mensagem: "O produto informado não foi encontrado.",
      erros: [],
    });
  }
}
