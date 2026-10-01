import { HttpStatus } from "@nestjs/common";
import {
  ListProdutosResponseSchema,
  ProdutoResponseSchema,
  StatusProduto,
  type ProdutoDetalhadoResponse,
  type ProdutoResumoResponse,
} from "@repo/contracts";
import { Prisma } from "@repo/database";
import {
  CreateProdutoBodyDto,
  ListProdutosQueryDto,
  ProdutoParamsDto,
  UpdateProdutoBodyDto,
} from "../dtos";
import { ProdutoResponseMapper } from "../mappers/produto-response.mapper";
import { ProdutoController } from "../produto.controller";
import { ProdutoService } from "../produto.service";
import type {
  ProdutoDetalhadoPayload,
  ProdutoResumoPayload,
} from "../types/produto.types";

const PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";

const CREATE_BODY = CreateProdutoBodyDto.create({
  sku: "PRODUTO-001",
  nome: "Produto de teste",
  status: StatusProduto.ATIVO,
  emDestaque: true,
  estoque: 10,
  preco: "100.00",
});

const UPDATE_BODY = UpdateProdutoBodyDto.create({
  nome: "Produto atualizado",
});

const LIST_QUERY = ListProdutosQueryDto.create({
  pagina: "2",
  limite: "10",
  pesquisa: "produto",
});

const PARAMS = ProdutoParamsDto.create({
  id: PRODUTO_ID,
});

const PRODUTO_RESUMO_PAYLOAD = {
  id: PRODUTO_ID,
  sku: "PRODUTO-001",
  nome: "Produto de teste",
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
} satisfies ProdutoResumoPayload;

const PRODUTO_DETALHADO_PAYLOAD = {
  ...PRODUTO_RESUMO_PAYLOAD,
  descricao: "Descrição do produto",
  urlManual: "https://example.com/manual.pdf",
} satisfies ProdutoDetalhadoPayload;

const PRODUTO_RESUMO_RESPONSE = {
  id: PRODUTO_ID,
  sku: "PRODUTO-001",
  nome: "Produto de teste",
  status: StatusProduto.ATIVO,
  emDestaque: true,
  estoque: 10,
  preco: "100.00",
  pesoKg: 2.5,
  quantidadeVendas: "15",
  dataValidade: "2028-02-29",
  disponivelEm: "2026-09-05T13:00:00.000Z",
  createdAt: "2026-09-01T10:20:30.123Z",
  updatedAt: "2026-09-02T11:21:31.456Z",
} satisfies ProdutoResumoResponse;

const PRODUTO_DETALHADO_RESPONSE = {
  ...PRODUTO_RESUMO_RESPONSE,
  descricao: "Descrição do produto",
  urlManual: "https://example.com/manual.pdf",
} satisfies ProdutoDetalhadoResponse;

type ProdutoServiceMock = jest.Mocked<
  Pick<
    ProdutoService,
    "create" | "list" | "findById" | "updateById" | "deleteById"
  >
>;

describe("ProdutoController", () => {
  let controller: ProdutoController;
  let service: ProdutoServiceMock;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    controller = new ProdutoController(service as unknown as ProdutoService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("cria o produto e monta o envelope de sucesso", async () => {
      service.create.mockResolvedValue(PRODUTO_DETALHADO_PAYLOAD);

      const mapperSpy = jest
        .spyOn(ProdutoResponseMapper, "toDetalhado")
        .mockReturnValue(PRODUTO_DETALHADO_RESPONSE);

      const resultado = await controller.create(CREATE_BODY);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith(CREATE_BODY);

      expect(mapperSpy).toHaveBeenCalledTimes(1);
      expect(mapperSpy).toHaveBeenCalledWith(PRODUTO_DETALHADO_PAYLOAD);

      expect(resultado).toEqual({
        status: HttpStatus.CREATED,
        sucesso: true,
        mensagem: "Produto criado com sucesso.",
        dados: PRODUTO_DETALHADO_RESPONSE,
      });

      expect(ProdutoResponseSchema.parse(resultado)).toEqual(resultado);
    });
  });

  describe("list", () => {
    it("lista os produtos e converte os metadados de paginação", async () => {
      service.list.mockResolvedValue({
        items: [PRODUTO_RESUMO_PAYLOAD],
        total: 21,
        page: 2,
        lastPage: 3,
        limit: 10,
      });

      const mapperSpy = jest
        .spyOn(ProdutoResponseMapper, "toResumo")
        .mockReturnValue(PRODUTO_RESUMO_RESPONSE);

      const resultado = await controller.list(LIST_QUERY);

      expect(service.list).toHaveBeenCalledTimes(1);
      expect(service.list).toHaveBeenCalledWith(LIST_QUERY);

      expect(mapperSpy).toHaveBeenCalledTimes(1);
      expect(mapperSpy).toHaveBeenCalledWith(PRODUTO_RESUMO_PAYLOAD);

      expect(resultado).toEqual({
        status: HttpStatus.OK,
        sucesso: true,
        mensagem: "Produtos listados com sucesso.",
        dados: [PRODUTO_RESUMO_RESPONSE],
        meta: {
          total: 21,
          pagina: 2,
          ultimaPagina: 3,
          limite: 10,
        },
      });

      expect(ListProdutosResponseSchema.parse(resultado)).toEqual(resultado);
    });
  });

  describe("findById", () => {
    it("busca o produto e monta o envelope de sucesso", async () => {
      service.findById.mockResolvedValue(PRODUTO_DETALHADO_PAYLOAD);

      const mapperSpy = jest
        .spyOn(ProdutoResponseMapper, "toDetalhado")
        .mockReturnValue(PRODUTO_DETALHADO_RESPONSE);

      const resultado = await controller.findById(PARAMS);

      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(service.findById).toHaveBeenCalledWith(PRODUTO_ID);

      expect(mapperSpy).toHaveBeenCalledTimes(1);
      expect(mapperSpy).toHaveBeenCalledWith(PRODUTO_DETALHADO_PAYLOAD);

      expect(resultado).toEqual({
        status: HttpStatus.OK,
        sucesso: true,
        mensagem: "Produto encontrado com sucesso.",
        dados: PRODUTO_DETALHADO_RESPONSE,
      });

      expect(ProdutoResponseSchema.parse(resultado)).toEqual(resultado);
    });
  });

  describe("updateById", () => {
    it("atualiza o produto e monta o envelope de sucesso", async () => {
      service.updateById.mockResolvedValue({
        ...PRODUTO_DETALHADO_PAYLOAD,
        nome: "Produto atualizado",
      });

      const produtoAtualizadoResponse = {
        ...PRODUTO_DETALHADO_RESPONSE,
        nome: "Produto atualizado",
      };

      const mapperSpy = jest
        .spyOn(ProdutoResponseMapper, "toDetalhado")
        .mockReturnValue(produtoAtualizadoResponse);

      const resultado = await controller.updateById(PARAMS, UPDATE_BODY);

      expect(service.updateById).toHaveBeenCalledTimes(1);
      expect(service.updateById).toHaveBeenCalledWith(PRODUTO_ID, UPDATE_BODY);

      expect(mapperSpy).toHaveBeenCalledTimes(1);

      expect(resultado).toEqual({
        status: HttpStatus.OK,
        sucesso: true,
        mensagem: "Produto atualizado com sucesso.",
        dados: produtoAtualizadoResponse,
      });

      expect(ProdutoResponseSchema.parse(resultado)).toEqual(resultado);
    });
  });

  describe("deleteById", () => {
    it("exclui o produto sem retornar corpo", async () => {
      service.deleteById.mockResolvedValue(undefined);

      await expect(controller.deleteById(PARAMS)).resolves.toBeUndefined();

      expect(service.deleteById).toHaveBeenCalledTimes(1);
      expect(service.deleteById).toHaveBeenCalledWith(PRODUTO_ID);
    });
  });
});
