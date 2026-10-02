import { HttpStatus } from "@nestjs/common";
import {
  AvaliacaoProdutoResponseSchema,
  ListAvaliacoesProdutoResponseSchema,
  type AvaliacaoProdutoDetalhadoResponse,
  type AvaliacaoProdutoResumoResponse,
} from "@repo/contracts";
import {
  AvaliacaoProdutoParamsDto,
  CreateAvaliacaoProdutoBodyDto,
  ListAvaliacoesProdutoQueryDto,
  ProdutoAvaliacaoParamsDto,
  UpdateAvaliacaoProdutoBodyDto,
} from "../dtos";
import { AvaliacaoProdutoController } from "../avaliacao-produto.controller";
import { AvaliacaoProdutoService } from "../avaliacao-produto.service";
import { AvaliacaoProdutoResponseMapper } from "../mappers/avaliacao-produto-response.mapper";
import type {
  AvaliacaoProdutoDetalhadoPayload,
  AvaliacaoProdutoResumoPayload,
} from "../types/avaliacao-produto.types";

const PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";
const AVALIACAO_ID = "4a01edb5-816d-4ad5-a55a-7f1939900929";

const COLLECTION_PARAMS = ProdutoAvaliacaoParamsDto.create({
  produtoId: PRODUTO_ID,
});

const ITEM_PARAMS = AvaliacaoProdutoParamsDto.create({
  produtoId: PRODUTO_ID,
  avaliacaoId: AVALIACAO_ID,
});

const CREATE_BODY = CreateAvaliacaoProdutoBodyDto.create({
  autorNome: "Ana Silva",
  nota: 4,
  comentario: "Produto muito bom.",
  recomenda: true,
});

const UPDATE_BODY = UpdateAvaliacaoProdutoBodyDto.create({
  nota: 5,
  comentario: null,
  recomenda: false,
});

const LIST_QUERY = ListAvaliacoesProdutoQueryDto.create({
  pagina: "2",
  limite: "10",
  pesquisa: "Ana",
  recomenda: "true",
});

const AVALIACAO_RESUMO_PAYLOAD = {
  id: AVALIACAO_ID,
  produtoId: PRODUTO_ID,
  autorNome: "Ana Silva",
  nota: 4,
  createdAt: new Date("2026-09-01T10:20:30.123Z"),
} satisfies AvaliacaoProdutoResumoPayload;

const AVALIACAO_DETALHADA_PAYLOAD = {
  ...AVALIACAO_RESUMO_PAYLOAD,
  comentario: "Produto muito bom.",
  recomenda: true,
  updatedAt: new Date("2026-09-02T11:21:31.456Z"),
} satisfies AvaliacaoProdutoDetalhadoPayload;

const AVALIACAO_RESUMO_RESPONSE = {
  id: AVALIACAO_ID,
  produtoId: PRODUTO_ID,
  autorNome: "Ana Silva",
  nota: 4,
  createdAt: "2026-09-01T10:20:30.123Z",
} satisfies AvaliacaoProdutoResumoResponse;

const AVALIACAO_DETALHADA_RESPONSE = {
  ...AVALIACAO_RESUMO_RESPONSE,
  comentario: "Produto muito bom.",
  recomenda: true,
  updatedAt: "2026-09-02T11:21:31.456Z",
} satisfies AvaliacaoProdutoDetalhadoResponse;

type AvaliacaoProdutoServiceMock = jest.Mocked<
  Pick<
    AvaliacaoProdutoService,
    "create" | "list" | "findById" | "updateById" | "deleteById"
  >
>;

describe("AvaliacaoProdutoController", () => {
  let controller: AvaliacaoProdutoController;
  let service: AvaliacaoProdutoServiceMock;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
    };

    controller = new AvaliacaoProdutoController(
      service as unknown as AvaliacaoProdutoService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("cria a avaliação e monta o envelope de sucesso", async () => {
      service.create.mockResolvedValue(AVALIACAO_DETALHADA_PAYLOAD);

      const mapperSpy = jest
        .spyOn(AvaliacaoProdutoResponseMapper, "toDetalhado")
        .mockReturnValue(AVALIACAO_DETALHADA_RESPONSE);

      const resultado = await controller.create(COLLECTION_PARAMS, CREATE_BODY);

      expect(service.create).toHaveBeenCalledWith(PRODUTO_ID, CREATE_BODY);

      expect(mapperSpy).toHaveBeenCalledWith(AVALIACAO_DETALHADA_PAYLOAD);

      expect(resultado).toEqual({
        status: HttpStatus.CREATED,
        sucesso: true,
        mensagem: "Avaliação criada com sucesso.",
        dados: AVALIACAO_DETALHADA_RESPONSE,
      });

      expect(AvaliacaoProdutoResponseSchema.parse(resultado)).toEqual(
        resultado,
      );
    });
  });

  describe("list", () => {
    it("lista as avaliações e monta a paginação", async () => {
      service.list.mockResolvedValue({
        items: [AVALIACAO_RESUMO_PAYLOAD],
        total: 21,
        page: 2,
        lastPage: 3,
        limit: 10,
      });

      const mapperSpy = jest
        .spyOn(AvaliacaoProdutoResponseMapper, "toResumo")
        .mockReturnValue(AVALIACAO_RESUMO_RESPONSE);

      const resultado = await controller.list(COLLECTION_PARAMS, LIST_QUERY);

      expect(service.list).toHaveBeenCalledWith(PRODUTO_ID, LIST_QUERY);

      expect(mapperSpy).toHaveBeenCalledTimes(1);
      expect(mapperSpy).toHaveBeenCalledWith(AVALIACAO_RESUMO_PAYLOAD);

      expect(resultado).toEqual({
        status: HttpStatus.OK,
        sucesso: true,
        mensagem: "Avaliações listadas com sucesso.",
        dados: [AVALIACAO_RESUMO_RESPONSE],
        meta: {
          total: 21,
          pagina: 2,
          ultimaPagina: 3,
          limite: 10,
        },
      });

      expect(ListAvaliacoesProdutoResponseSchema.parse(resultado)).toEqual(
        resultado,
      );
    });
  });

  describe("findById", () => {
    it("busca a avaliação e monta o envelope de sucesso", async () => {
      service.findById.mockResolvedValue(AVALIACAO_DETALHADA_PAYLOAD);

      const mapperSpy = jest
        .spyOn(AvaliacaoProdutoResponseMapper, "toDetalhado")
        .mockReturnValue(AVALIACAO_DETALHADA_RESPONSE);

      const resultado = await controller.findById(ITEM_PARAMS);

      expect(service.findById).toHaveBeenCalledWith(PRODUTO_ID, AVALIACAO_ID);

      expect(mapperSpy).toHaveBeenCalledWith(AVALIACAO_DETALHADA_PAYLOAD);

      expect(resultado).toEqual({
        status: HttpStatus.OK,
        sucesso: true,
        mensagem: "Avaliação encontrada com sucesso.",
        dados: AVALIACAO_DETALHADA_RESPONSE,
      });

      expect(AvaliacaoProdutoResponseSchema.parse(resultado)).toEqual(
        resultado,
      );
    });
  });

  describe("updateById", () => {
    it("atualiza a avaliação e monta o envelope de sucesso", async () => {
      const payloadAtualizado = {
        ...AVALIACAO_DETALHADA_PAYLOAD,
        nota: 5,
        comentario: null,
        recomenda: false,
      };

      const responseAtualizado = {
        ...AVALIACAO_DETALHADA_RESPONSE,
        nota: 5,
        comentario: null,
        recomenda: false,
      };

      service.updateById.mockResolvedValue(payloadAtualizado);

      const mapperSpy = jest
        .spyOn(AvaliacaoProdutoResponseMapper, "toDetalhado")
        .mockReturnValue(responseAtualizado);

      const resultado = await controller.updateById(ITEM_PARAMS, UPDATE_BODY);

      expect(service.updateById).toHaveBeenCalledWith(
        PRODUTO_ID,
        AVALIACAO_ID,
        UPDATE_BODY,
      );

      expect(mapperSpy).toHaveBeenCalledWith(payloadAtualizado);

      expect(resultado).toEqual({
        status: HttpStatus.OK,
        sucesso: true,
        mensagem: "Avaliação atualizada com sucesso.",
        dados: responseAtualizado,
      });

      expect(AvaliacaoProdutoResponseSchema.parse(resultado)).toEqual(
        resultado,
      );
    });
  });

  describe("deleteById", () => {
    it("exclui a avaliação sem retornar corpo", async () => {
      service.deleteById.mockResolvedValue(undefined);

      await expect(controller.deleteById(ITEM_PARAMS)).resolves.toBeUndefined();

      expect(service.deleteById).toHaveBeenCalledWith(PRODUTO_ID, AVALIACAO_ID);
    });
  });
});
