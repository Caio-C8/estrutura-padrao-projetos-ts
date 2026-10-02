import { Injectable, NotFoundException } from "@nestjs/common";
import { AvaliacaoProdutoRepository } from "./avaliacao-produto.repository";
import type {
  ListAvaliacoesProdutoResult,
  AvaliacaoProdutoDetalhadoPayload,
} from "./types/avaliacao-produto.types";
import type {
  CreateAvaliacaoProdutoData,
  ListAvaliacoesProdutoQueryData,
  UpdateAvaliacaoProdutoData,
} from "@repo/contracts";
import { Prisma } from "@repo/database";
import { AvaliacaoProdutoPersistenceMapper } from "./mappers/avaliacao-produto-persistence.mapper";
import { ProdutoRepository } from "../produto.repository";

const AVALIACOES_PRODUTO_ORDER_BY = [
  { createdAt: "desc" },
  { id: "desc" },
] satisfies Prisma.AvaliacaoProdutoOrderByWithRelationInput[];

type RecursoAusente = "produto" | "avaliacao";

@Injectable()
export class AvaliacaoProdutoService {
  constructor(
    private readonly avaliacaoProdutoRepository: AvaliacaoProdutoRepository,
    private readonly produtoRepository: ProdutoRepository,
  ) {}

  async create(
    produtoId: string,
    avaliacao: CreateAvaliacaoProdutoData,
  ): Promise<AvaliacaoProdutoDetalhadoPayload> {
    try {
      return await this.avaliacaoProdutoRepository.create(
        AvaliacaoProdutoPersistenceMapper.toCreateInput(produtoId, avaliacao),
      );
    } catch (erro: unknown) {
      return this.lancarErroDePersistencia(erro, "produto");
    }
  }

  async list(
    produtoId: string,
    query: ListAvaliacoesProdutoQueryData,
  ): Promise<ListAvaliacoesProdutoResult> {
    const produtoExiste = await this.produtoRepository.existsById(produtoId);

    if (!produtoExiste) {
      throw this.criarErroProdutoNaoEncontrado();
    }

    const where = AvaliacaoProdutoPersistenceMapper.toWhere(produtoId, query);
    const skip = (query.pagina - 1) * query.limite;

    const [items, total] = await Promise.all([
      this.avaliacaoProdutoRepository.findMany({
        where,
        orderBy: AVALIACOES_PRODUTO_ORDER_BY,
        skip,
        take: query.limite,
      }),
      this.avaliacaoProdutoRepository.count(where),
    ]);

    return {
      items,
      total,
      page: query.pagina,
      lastPage: Math.max(1, Math.ceil(total / query.limite)),
      limit: query.limite,
    };
  }

  async findById(
    produtoId: string,
    avaliacaoId: string,
  ): Promise<AvaliacaoProdutoDetalhadoPayload> {
    const produtoExiste = await this.produtoRepository.existsById(produtoId);

    if (!produtoExiste) {
      throw this.criarErroProdutoNaoEncontrado();
    }

    const avaliacao = await this.avaliacaoProdutoRepository.findById(
      produtoId,
      avaliacaoId,
    );

    if (!avaliacao) {
      throw this.criarErroAvaliacaoNaoEncontrada();
    }

    return avaliacao;
  }

  async updateById(
    produtoId: string,
    avaliacaoId: string,
    avaliacao: UpdateAvaliacaoProdutoData,
  ): Promise<AvaliacaoProdutoDetalhadoPayload> {
    try {
      const produtoExiste = await this.produtoRepository.existsById(produtoId);

      if (!produtoExiste) {
        throw this.criarErroProdutoNaoEncontrado();
      }

      return await this.avaliacaoProdutoRepository.updateById(
        produtoId,
        avaliacaoId,
        AvaliacaoProdutoPersistenceMapper.toUpdateInput(avaliacao),
      );
    } catch (erro: unknown) {
      return this.lancarErroDePersistencia(erro, "avaliacao");
    }
  }

  async deleteById(produtoId: string, avaliacaoId: string): Promise<void> {
    try {
      const produtoExiste = await this.produtoRepository.existsById(produtoId);

      if (!produtoExiste) {
        throw this.criarErroProdutoNaoEncontrado();
      }

      await this.avaliacaoProdutoRepository.deleteById(produtoId, avaliacaoId);
    } catch (erro: unknown) {
      return this.lancarErroDePersistencia(erro, "avaliacao");
    }
  }

  private lancarErroDePersistencia(
    erro: unknown,
    recursoAusente: RecursoAusente,
  ): never {
    if (erro instanceof Prisma.PrismaClientKnownRequestError) {
      if (erro.code === "P2025") {
        if (recursoAusente === "produto") {
          throw this.criarErroProdutoNaoEncontrado();
        }

        throw this.criarErroAvaliacaoNaoEncontrada();
      }

      if (erro.code === "P2003" && recursoAusente === "produto") {
        throw this.criarErroProdutoNaoEncontrado();
      }
    }

    throw erro;
  }

  private criarErroProdutoNaoEncontrado(): NotFoundException {
    return new NotFoundException({
      codigo: "PRODUTO_NAO_ENCONTRADO",
      mensagem: "O produto informado não foi encontrado.",
      erros: [],
    });
  }

  private criarErroAvaliacaoNaoEncontrada(): NotFoundException {
    return new NotFoundException({
      codigo: "AVALIACAO_PRODUTO_NAO_ENCONTRADA",
      mensagem: "A avaliação informada não foi encontrada.",
      erros: [],
    });
  }
}
