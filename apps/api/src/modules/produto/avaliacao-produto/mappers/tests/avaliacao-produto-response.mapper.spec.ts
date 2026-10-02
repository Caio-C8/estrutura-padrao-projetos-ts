import {
  AvaliacaoProdutoDetalhadoResponseSchema,
  AvaliacaoProdutoResumoResponseSchema,
} from "@repo/contracts";
import { AvaliacaoProdutoResponseMapper } from "../avaliacao-produto-response.mapper";
import type {
  AvaliacaoProdutoDetalhadoPayload,
  AvaliacaoProdutoResumoPayload,
} from "../../types/avaliacao-produto.types";

const PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";
const AVALIACAO_ID = "4a01edb5-816d-4ad5-a55a-7f1939900929";

const CREATED_AT = new Date("2026-09-01T10:20:30.123Z");
const UPDATED_AT = new Date("2026-09-02T11:21:31.456Z");

function criarResumo(): AvaliacaoProdutoResumoPayload {
  return {
    id: AVALIACAO_ID,
    produtoId: PRODUTO_ID,
    autorNome: "Ana Silva",
    nota: 4,
    createdAt: CREATED_AT,
  };
}

function criarDetalhado(
  alteracoes: Partial<AvaliacaoProdutoDetalhadoPayload> = {},
): AvaliacaoProdutoDetalhadoPayload {
  return {
    ...criarResumo(),
    comentario: "Produto muito bom.",
    recomenda: true,
    updatedAt: UPDATED_AT,
    ...alteracoes,
  };
}

describe("AvaliacaoProdutoResponseMapper", () => {
  describe("toResumo", () => {
    it("converte o payload resumido para o contrato de resposta", () => {
      const resultado = AvaliacaoProdutoResponseMapper.toResumo(criarResumo());

      expect(resultado).toEqual({
        id: AVALIACAO_ID,
        produtoId: PRODUTO_ID,
        autorNome: "Ana Silva",
        nota: 4,
        createdAt: "2026-09-01T10:20:30.123Z",
      });

      expect(AvaliacaoProdutoResumoResponseSchema.parse(resultado)).toEqual(
        resultado,
      );
    });

    it("converte createdAt para uma string ISO 8601 em UTC", () => {
      const resultado = AvaliacaoProdutoResponseMapper.toResumo(criarResumo());

      expect(resultado.createdAt).toBe(CREATED_AT.toISOString());
      expect(resultado.createdAt).toMatch(/Z$/);
    });
  });

  describe("toDetalhado", () => {
    it("converte o payload detalhado para o contrato de resposta", () => {
      const resultado =
        AvaliacaoProdutoResponseMapper.toDetalhado(criarDetalhado());

      expect(resultado).toEqual({
        id: AVALIACAO_ID,
        produtoId: PRODUTO_ID,
        autorNome: "Ana Silva",
        nota: 4,
        comentario: "Produto muito bom.",
        recomenda: true,
        createdAt: "2026-09-01T10:20:30.123Z",
        updatedAt: "2026-09-02T11:21:31.456Z",
      });

      expect(AvaliacaoProdutoDetalhadoResponseSchema.parse(resultado)).toEqual(
        resultado,
      );
    });

    it("preserva comentário nulo", () => {
      const resultado = AvaliacaoProdutoResponseMapper.toDetalhado(
        criarDetalhado({
          comentario: null,
        }),
      );

      expect(resultado.comentario).toBeNull();

      expect(AvaliacaoProdutoDetalhadoResponseSchema.parse(resultado)).toEqual(
        resultado,
      );
    });

    it("preserva recomenda com valor false", () => {
      const resultado = AvaliacaoProdutoResponseMapper.toDetalhado(
        criarDetalhado({
          recomenda: false,
        }),
      );

      expect(resultado.recomenda).toBe(false);
    });

    it("converte updatedAt para uma string ISO 8601 em UTC", () => {
      const resultado =
        AvaliacaoProdutoResponseMapper.toDetalhado(criarDetalhado());

      expect(resultado.updatedAt).toBe(UPDATED_AT.toISOString());
      expect(resultado.updatedAt).toMatch(/Z$/);
    });
  });
});
