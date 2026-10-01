import {
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import {
  StatusProduto,
  type CreateProdutoData,
  type ListProdutosQueryData,
  type UpdateProdutoData,
} from "@repo/contracts";
import { Prisma } from "@repo/database";
import { ProdutoPersistenceMapper } from "../mappers/produto-persistence.mapper";
import { ProdutoRepository } from "../produto.repository";
import { ProdutoService } from "../produto.service";
import type { ProdutoDetalhadoPayload } from "../types/produto.types";

const PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";

const CREATE_DATA = {
  sku: "PRODUTO-001",
  nome: "Produto de teste",
  status: StatusProduto.ATIVO,
  emDestaque: true,
  estoque: 10,
  preco: "100.00",
} satisfies CreateProdutoData;

const UPDATE_DATA = {
  nome: "Produto atualizado",
} satisfies UpdateProdutoData;

const LIST_QUERY = {
  pagina: 2,
  limite: 10,
  pesquisa: "produto",
  status: StatusProduto.ATIVO,
} satisfies ListProdutosQueryData;

const CREATE_INPUT = {
  sku: "PRODUTO-001",
  nome: "Produto de teste",
  status: StatusProduto.ATIVO,
  emDestaque: true,
  estoque: 10,
  preco: "100.00",
} satisfies Prisma.ProdutoCreateInput;

const UPDATE_INPUT = {
  nome: "Produto atualizado",
} satisfies Prisma.ProdutoUpdateInput;

type ProdutoRepositoryMock = jest.Mocked<
  Pick<
    ProdutoRepository,
    "create" | "findMany" | "count" | "findById" | "updateById" | "deleteById"
  >
>;

function criarProduto(
  alteracoes: Partial<ProdutoDetalhadoPayload> = {},
): ProdutoDetalhadoPayload {
  return {
    id: PRODUTO_ID,
    sku: "PRODUTO-001",
    nome: "Produto de teste",
    descricao: "Descrição do produto",
    urlManual: "https://example.com/manual.pdf",
    status: StatusProduto.ATIVO,
    emDestaque: true,
    estoque: 10,
    preco: new Prisma.Decimal("100.00"),
    pesoKg: 2.5,
    quantidadeVendas: 15n,
    dataValidade: new Date("2028-02-29T00:00:00.000Z"),
    disponivelEm: new Date("2026-09-05T13:00:00.000Z"),
    createdAt: new Date("2026-09-01T10:20:30.123Z"),
    updatedAt: new Date("2026-09-02T11:21:31.456Z"),
    ...alteracoes,
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

describe("ProdutoService", () => {
  let service: ProdutoService;
  let repository: ProdutoRepositoryMock;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    service = new ProdutoService(repository as unknown as ProdutoRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("mapeia os dados e encaminha a criação ao repository", async () => {
      const produto = criarProduto();

      const mapperSpy = jest
        .spyOn(ProdutoPersistenceMapper, "toCreateInput")
        .mockReturnValue(CREATE_INPUT);

      repository.create.mockResolvedValue(produto);

      const resultado = await service.create(CREATE_DATA);

      expect(mapperSpy).toHaveBeenCalledTimes(1);
      expect(mapperSpy).toHaveBeenCalledWith(CREATE_DATA);
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(CREATE_INPUT);
      expect(resultado).toBe(produto);
    });

    it("converte P2002 em conflito de SKU", async () => {
      jest
        .spyOn(ProdutoPersistenceMapper, "toCreateInput")
        .mockReturnValue(CREATE_INPUT);

      repository.create.mockRejectedValue(criarErroPrisma("P2002"));

      const excecao = await capturarExcecaoHttp(service.create(CREATE_DATA));

      expect(excecao).toBeInstanceOf(ConflictException);
      expect(excecao.getStatus()).toBe(HttpStatus.CONFLICT);

      expect(excecao.getResponse()).toEqual({
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
    });

    it("não mascara um erro de persistência desconhecido", async () => {
      const erro = new Error("Falha inesperada.");

      jest
        .spyOn(ProdutoPersistenceMapper, "toCreateInput")
        .mockReturnValue(CREATE_INPUT);

      repository.create.mockRejectedValue(erro);

      await expect(service.create(CREATE_DATA)).rejects.toBe(erro);
    });
  });

  describe("list", () => {
    it("aplica filtro, paginação e ordenação determinística", async () => {
      const where = {
        status: StatusProduto.ATIVO,
      } satisfies Prisma.ProdutoWhereInput;

      const items = [criarProduto()];

      const mapperSpy = jest
        .spyOn(ProdutoPersistenceMapper, "toWhere")
        .mockReturnValue(where);

      repository.findMany.mockResolvedValue(items);
      repository.count.mockResolvedValue(21);

      const resultado = await service.list(LIST_QUERY);

      expect(mapperSpy).toHaveBeenCalledTimes(1);
      expect(mapperSpy).toHaveBeenCalledWith(LIST_QUERY);

      expect(repository.findMany).toHaveBeenCalledWith({
        where,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: 10,
        take: 10,
      });

      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(repository.count).toHaveBeenCalledWith(where);

      expect(resultado).toEqual({
        items,
        total: 21,
        page: 2,
        lastPage: 3,
        limit: 10,
      });
    });

    it("mantém a última página como 1 quando a coleção está vazia", async () => {
      const query = {
        pagina: 1,
        limite: 20,
      } satisfies ListProdutosQueryData;

      jest.spyOn(ProdutoPersistenceMapper, "toWhere").mockReturnValue({});

      repository.findMany.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const resultado = await service.list(query);

      expect(resultado).toEqual({
        items: [],
        total: 0,
        page: 1,
        lastPage: 1,
        limit: 20,
      });
    });
  });

  describe("findById", () => {
    it("retorna o produto encontrado", async () => {
      const produto = criarProduto();

      repository.findById.mockResolvedValue(produto);

      const resultado = await service.findById(PRODUTO_ID);

      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(repository.findById).toHaveBeenCalledWith(PRODUTO_ID);
      expect(resultado).toBe(produto);
    });

    it("lança NotFoundException quando o produto não existe", async () => {
      repository.findById.mockResolvedValue(null);

      const excecao = await capturarExcecaoHttp(service.findById(PRODUTO_ID));

      expect(excecao).toBeInstanceOf(NotFoundException);
      expect(excecao.getStatus()).toBe(HttpStatus.NOT_FOUND);

      expect(excecao.getResponse()).toEqual({
        codigo: "PRODUTO_NAO_ENCONTRADO",
        mensagem: "O produto informado não foi encontrado.",
        erros: [],
      });
    });
  });

  describe("updateById", () => {
    it("mapeia os dados e encaminha a atualização ao repository", async () => {
      const produto = criarProduto({
        nome: "Produto atualizado",
      });

      const mapperSpy = jest
        .spyOn(ProdutoPersistenceMapper, "toUpdateInput")
        .mockReturnValue(UPDATE_INPUT);

      repository.updateById.mockResolvedValue(produto);

      const resultado = await service.updateById(PRODUTO_ID, UPDATE_DATA);

      expect(mapperSpy).toHaveBeenCalledTimes(1);
      expect(mapperSpy).toHaveBeenCalledWith(UPDATE_DATA);

      expect(repository.updateById).toHaveBeenCalledTimes(1);
      expect(repository.updateById).toHaveBeenCalledWith(
        PRODUTO_ID,
        UPDATE_INPUT,
      );

      expect(resultado).toBe(produto);
    });

    it("converte P2025 em produto não encontrado", async () => {
      jest
        .spyOn(ProdutoPersistenceMapper, "toUpdateInput")
        .mockReturnValue(UPDATE_INPUT);

      repository.updateById.mockRejectedValue(criarErroPrisma("P2025"));

      const excecao = await capturarExcecaoHttp(
        service.updateById(PRODUTO_ID, UPDATE_DATA),
      );

      expect(excecao).toBeInstanceOf(NotFoundException);
      expect(excecao.getStatus()).toBe(HttpStatus.NOT_FOUND);

      expect(excecao.getResponse()).toEqual({
        codigo: "PRODUTO_NAO_ENCONTRADO",
        mensagem: "O produto informado não foi encontrado.",
        erros: [],
      });
    });
  });

  describe("deleteById", () => {
    it("encaminha a exclusão ao repository", async () => {
      repository.deleteById.mockResolvedValue(undefined);

      await expect(service.deleteById(PRODUTO_ID)).resolves.toBeUndefined();

      expect(repository.deleteById).toHaveBeenCalledTimes(1);
      expect(repository.deleteById).toHaveBeenCalledWith(PRODUTO_ID);
    });

    it("converte P2025 em produto não encontrado", async () => {
      repository.deleteById.mockRejectedValue(criarErroPrisma("P2025"));

      const excecao = await capturarExcecaoHttp(service.deleteById(PRODUTO_ID));

      expect(excecao).toBeInstanceOf(NotFoundException);
      expect(excecao.getStatus()).toBe(HttpStatus.NOT_FOUND);

      expect(excecao.getResponse()).toEqual({
        codigo: "PRODUTO_NAO_ENCONTRADO",
        mensagem: "O produto informado não foi encontrado.",
        erros: [],
      });
    });
  });
});
