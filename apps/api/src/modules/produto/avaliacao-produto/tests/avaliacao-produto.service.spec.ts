import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import type {
  CreateAvaliacaoProdutoData,
  ListAvaliacoesProdutoQueryData,
  UpdateAvaliacaoProdutoData,
} from "@repo/contracts";
import { Prisma } from "@repo/database";
import { ProdutoRepository } from "../../produto.repository";
import { AvaliacaoProdutoRepository } from "../avaliacao-produto.repository";
import { AvaliacaoProdutoService } from "../avaliacao-produto.service";
import { AvaliacaoProdutoPersistenceMapper } from "../mappers/avaliacao-produto-persistence.mapper";
import type {
  AvaliacaoProdutoDetalhadoPayload,
  AvaliacaoProdutoResumoPayload,
} from "../types/avaliacao-produto.types";

const PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";
const AVALIACAO_ID = "4a01edb5-816d-4ad5-a55a-7f1939900929";

const CREATE_DATA = {
  autorNome: "Ana Silva",
  nota: 4,
  comentario: "Produto muito bom.",
  recomenda: true,
} satisfies CreateAvaliacaoProdutoData;

const UPDATE_DATA = {
  nota: 5,
  comentario: null,
  recomenda: false,
} satisfies UpdateAvaliacaoProdutoData;

const LIST_QUERY = {
  pagina: 2,
  limite: 10,
  pesquisa: "Ana",
  recomenda: true,
} satisfies ListAvaliacoesProdutoQueryData;

const CREATE_INPUT = {
  autorNome: "Ana Silva",
  nota: 4,
  comentario: "Produto muito bom.",
  recomenda: true,
  produto: {
    connect: {
      id: PRODUTO_ID,
    },
  },
} satisfies Prisma.AvaliacaoProdutoCreateInput;

const UPDATE_INPUT = {
  nota: 5,
  comentario: null,
  recomenda: false,
} satisfies Prisma.AvaliacaoProdutoUpdateInput;

type AvaliacaoProdutoRepositoryMock = jest.Mocked<
  Pick<
    AvaliacaoProdutoRepository,
    "create" | "findMany" | "count" | "findById" | "updateById" | "deleteById"
  >
>;

type ProdutoRepositoryMock = jest.Mocked<Pick<ProdutoRepository, "existsById">>;

function criarAvaliacao(
  alteracoes: Partial<AvaliacaoProdutoDetalhadoPayload> = {},
): AvaliacaoProdutoDetalhadoPayload {
  return {
    id: AVALIACAO_ID,
    produtoId: PRODUTO_ID,
    autorNome: "Ana Silva",
    nota: 4,
    comentario: "Produto muito bom.",
    recomenda: true,
    createdAt: new Date("2026-09-01T10:20:30.123Z"),
    updatedAt: new Date("2026-09-02T11:21:31.456Z"),
    ...alteracoes,
  };
}

function criarResumo(): AvaliacaoProdutoResumoPayload {
  return {
    id: AVALIACAO_ID,
    produtoId: PRODUTO_ID,
    autorNome: "Ana Silva",
    nota: 4,
    createdAt: new Date("2026-09-01T10:20:30.123Z"),
  };
}

function criarErroPrisma(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError("Erro simulado.", {
    code,
    clientVersion: "teste",
  });
}

async function capturarExcecaoHttp(
  operacao: Promise<unknown>,
): Promise<HttpException> {
  try {
    await operacao;
  } catch (erro: unknown) {
    if (erro instanceof HttpException) {
      return erro;
    }

    throw erro;
  }

  throw new Error("A operação deveria ter lançado uma HttpException.");
}

function esperarErroNaoEncontrado(
  excecao: HttpException,
  codigo: string,
  mensagem: string,
): void {
  expect(excecao).toBeInstanceOf(NotFoundException);
  expect(excecao.getStatus()).toBe(HttpStatus.NOT_FOUND);
  expect(excecao.getResponse()).toEqual({
    codigo,
    mensagem,
    erros: [],
  });
}

describe("AvaliacaoProdutoService", () => {
  let service: AvaliacaoProdutoService;
  let repository: AvaliacaoProdutoRepositoryMock;
  let produtoRepository: ProdutoRepositoryMock;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    produtoRepository = {
      existsById: jest.fn().mockResolvedValue(true),
    };

    service = new AvaliacaoProdutoService(
      repository as unknown as AvaliacaoProdutoRepository,
      produtoRepository as unknown as ProdutoRepository,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("mapeia os dados e encaminha a criação ao repository", async () => {
      const avaliacao = criarAvaliacao();

      const mapperSpy = jest
        .spyOn(AvaliacaoProdutoPersistenceMapper, "toCreateInput")
        .mockReturnValue(CREATE_INPUT);

      repository.create.mockResolvedValue(avaliacao);

      const resultado = await service.create(PRODUTO_ID, CREATE_DATA);

      expect(mapperSpy).toHaveBeenCalledWith(PRODUTO_ID, CREATE_DATA);
      expect(repository.create).toHaveBeenCalledWith(CREATE_INPUT);
      expect(resultado).toBe(avaliacao);
    });

    it.each(["P2003", "P2025"])(
      "converte %s em produto não encontrado",
      async (codigoPrisma) => {
        jest
          .spyOn(AvaliacaoProdutoPersistenceMapper, "toCreateInput")
          .mockReturnValue(CREATE_INPUT);

        repository.create.mockRejectedValue(criarErroPrisma(codigoPrisma));

        const excecao = await capturarExcecaoHttp(
          service.create(PRODUTO_ID, CREATE_DATA),
        );

        esperarErroNaoEncontrado(
          excecao,
          "PRODUTO_NAO_ENCONTRADO",
          "O produto informado não foi encontrado.",
        );
      },
    );

    it("não mascara um erro de persistência desconhecido", async () => {
      const erro = new Error("Falha inesperada.");

      jest
        .spyOn(AvaliacaoProdutoPersistenceMapper, "toCreateInput")
        .mockReturnValue(CREATE_INPUT);

      repository.create.mockRejectedValue(erro);

      await expect(service.create(PRODUTO_ID, CREATE_DATA)).rejects.toBe(erro);
    });
  });

  describe("list", () => {
    it("valida o produto e aplica filtro, paginação e ordenação", async () => {
      const where = {
        produtoId: PRODUTO_ID,
        recomenda: true,
      } satisfies Prisma.AvaliacaoProdutoWhereInput;

      const items = [criarResumo()];

      const mapperSpy = jest
        .spyOn(AvaliacaoProdutoPersistenceMapper, "toWhere")
        .mockReturnValue(where);

      repository.findMany.mockResolvedValue(items);
      repository.count.mockResolvedValue(21);

      const resultado = await service.list(PRODUTO_ID, LIST_QUERY);

      expect(produtoRepository.existsById).toHaveBeenCalledWith(PRODUTO_ID);

      expect(mapperSpy).toHaveBeenCalledWith(PRODUTO_ID, LIST_QUERY);

      expect(repository.findMany).toHaveBeenCalledWith({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: 10,
        take: 10,
      });

      expect(repository.count).toHaveBeenCalledWith(where);

      expect(resultado).toEqual({
        items,
        total: 21,
        page: 2,
        lastPage: 3,
        limit: 10,
      });
    });

    it("mantém a última página como 1 quando não há avaliações", async () => {
      const query = {
        pagina: 1,
        limite: 20,
      } satisfies ListAvaliacoesProdutoQueryData;

      jest
        .spyOn(AvaliacaoProdutoPersistenceMapper, "toWhere")
        .mockReturnValue({ produtoId: PRODUTO_ID });

      repository.findMany.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const resultado = await service.list(PRODUTO_ID, query);

      expect(resultado).toEqual({
        items: [],
        total: 0,
        page: 1,
        lastPage: 1,
        limit: 20,
      });
    });

    it("lança erro quando o produto não existe", async () => {
      produtoRepository.existsById.mockResolvedValue(false);

      const excecao = await capturarExcecaoHttp(
        service.list(PRODUTO_ID, LIST_QUERY),
      );

      esperarErroNaoEncontrado(
        excecao,
        "PRODUTO_NAO_ENCONTRADO",
        "O produto informado não foi encontrado.",
      );

      expect(repository.findMany).not.toHaveBeenCalled();
      expect(repository.count).not.toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("retorna a avaliação encontrada", async () => {
      const avaliacao = criarAvaliacao();

      repository.findById.mockResolvedValue(avaliacao);

      const resultado = await service.findById(PRODUTO_ID, AVALIACAO_ID);

      expect(produtoRepository.existsById).toHaveBeenCalledWith(PRODUTO_ID);

      expect(repository.findById).toHaveBeenCalledWith(
        PRODUTO_ID,
        AVALIACAO_ID,
      );

      expect(resultado).toBe(avaliacao);
    });

    it("lança erro quando o produto não existe", async () => {
      produtoRepository.existsById.mockResolvedValue(false);

      const excecao = await capturarExcecaoHttp(
        service.findById(PRODUTO_ID, AVALIACAO_ID),
      );

      esperarErroNaoEncontrado(
        excecao,
        "PRODUTO_NAO_ENCONTRADO",
        "O produto informado não foi encontrado.",
      );

      expect(repository.findById).not.toHaveBeenCalled();
    });

    it("lança erro quando a avaliação não existe", async () => {
      repository.findById.mockResolvedValue(null);

      const excecao = await capturarExcecaoHttp(
        service.findById(PRODUTO_ID, AVALIACAO_ID),
      );

      esperarErroNaoEncontrado(
        excecao,
        "AVALIACAO_PRODUTO_NAO_ENCONTRADA",
        "A avaliação informada não foi encontrada.",
      );
    });
  });

  describe("updateById", () => {
    it("mapeia os dados e encaminha a atualização", async () => {
      const avaliacao = criarAvaliacao({
        nota: 5,
        comentario: null,
        recomenda: false,
      });

      const mapperSpy = jest
        .spyOn(AvaliacaoProdutoPersistenceMapper, "toUpdateInput")
        .mockReturnValue(UPDATE_INPUT);

      repository.updateById.mockResolvedValue(avaliacao);

      const resultado = await service.updateById(
        PRODUTO_ID,
        AVALIACAO_ID,
        UPDATE_DATA,
      );

      expect(produtoRepository.existsById).toHaveBeenCalledWith(PRODUTO_ID);

      expect(mapperSpy).toHaveBeenCalledWith(UPDATE_DATA);

      expect(repository.updateById).toHaveBeenCalledWith(
        PRODUTO_ID,
        AVALIACAO_ID,
        UPDATE_INPUT,
      );

      expect(resultado).toBe(avaliacao);
    });

    it("lança erro quando o produto não existe", async () => {
      produtoRepository.existsById.mockResolvedValue(false);

      const excecao = await capturarExcecaoHttp(
        service.updateById(PRODUTO_ID, AVALIACAO_ID, UPDATE_DATA),
      );

      esperarErroNaoEncontrado(
        excecao,
        "PRODUTO_NAO_ENCONTRADO",
        "O produto informado não foi encontrado.",
      );

      expect(repository.updateById).not.toHaveBeenCalled();
    });

    it("converte P2025 em avaliação não encontrada", async () => {
      jest
        .spyOn(AvaliacaoProdutoPersistenceMapper, "toUpdateInput")
        .mockReturnValue(UPDATE_INPUT);

      repository.updateById.mockRejectedValue(criarErroPrisma("P2025"));

      const excecao = await capturarExcecaoHttp(
        service.updateById(PRODUTO_ID, AVALIACAO_ID, UPDATE_DATA),
      );

      esperarErroNaoEncontrado(
        excecao,
        "AVALIACAO_PRODUTO_NAO_ENCONTRADA",
        "A avaliação informada não foi encontrada.",
      );
    });
  });

  describe("deleteById", () => {
    it("encaminha a exclusão ao repository", async () => {
      repository.deleteById.mockResolvedValue(undefined);

      await expect(
        service.deleteById(PRODUTO_ID, AVALIACAO_ID),
      ).resolves.toBeUndefined();

      expect(produtoRepository.existsById).toHaveBeenCalledWith(PRODUTO_ID);

      expect(repository.deleteById).toHaveBeenCalledWith(
        PRODUTO_ID,
        AVALIACAO_ID,
      );
    });

    it("lança erro quando o produto não existe", async () => {
      produtoRepository.existsById.mockResolvedValue(false);

      const excecao = await capturarExcecaoHttp(
        service.deleteById(PRODUTO_ID, AVALIACAO_ID),
      );

      esperarErroNaoEncontrado(
        excecao,
        "PRODUTO_NAO_ENCONTRADO",
        "O produto informado não foi encontrado.",
      );

      expect(repository.deleteById).not.toHaveBeenCalled();
    });

    it("converte P2025 em avaliação não encontrada", async () => {
      repository.deleteById.mockRejectedValue(criarErroPrisma("P2025"));

      const excecao = await capturarExcecaoHttp(
        service.deleteById(PRODUTO_ID, AVALIACAO_ID),
      );

      esperarErroNaoEncontrado(
        excecao,
        "AVALIACAO_PRODUTO_NAO_ENCONTRADA",
        "A avaliação informada não foi encontrada.",
      );
    });
  });
});
