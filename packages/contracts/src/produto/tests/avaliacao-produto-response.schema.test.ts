import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../../contract-assertions";
import {
  criarAvaliacaoProdutoDetalhadaValida,
  criarAvaliacaoProdutoResumoValida,
} from "./avaliacao-produto.fixtures";
import {
  AvaliacaoProdutoDetalhadoResponseSchema,
  AvaliacaoProdutoResponseSchema,
  AvaliacaoProdutoResumoResponseSchema,
  ListAvaliacoesProdutoResponseSchema,
} from "../avaliacao-produto-response.schema";

describe("AvaliacaoProdutoDetalhadoResponseSchema", () => {
  it("aceita a representação serializada completa", () => {
    const avaliacao = criarAvaliacaoProdutoDetalhadaValida();

    assert.deepEqual(
      parseValido(AvaliacaoProdutoDetalhadoResponseSchema, avaliacao),
      avaliacao,
    );
  });

  it("aceita comentário null", () => {
    const resultado = parseValido(AvaliacaoProdutoDetalhadoResponseSchema, {
      ...criarAvaliacaoProdutoDetalhadaValida(),
      comentario: null,
    });

    assert.equal(resultado.comentario, null);
  });

  it("rejeita representações e valores inválidos", () => {
    const avaliacao = criarAvaliacaoProdutoDetalhadaValida();

    esperaInvalidos(AvaliacaoProdutoDetalhadoResponseSchema, [
      { ...avaliacao, id: "avaliacao-1" },
      { ...avaliacao, produtoId: "produto-1" },
      { ...avaliacao, nota: "5" },
      { ...avaliacao, nota: 0 },
      { ...avaliacao, nota: 6 },
      { ...avaliacao, nota: 1.5 },
      { ...avaliacao, comentario: "" },
      { ...avaliacao, recomenda: "true" },
      { ...avaliacao, createdAt: new Date() },
      { ...avaliacao, createdAt: "2026-09-27T12:00:00Z" },
      { ...avaliacao, updatedAt: "2026-09-27T10:00:00-03:00" },
      { ...avaliacao, campoInterno: "valor" },
    ]);
  });
});

describe("AvaliacaoProdutoResumoResponseSchema", () => {
  it("aceita a representação resumida", () => {
    const avaliacao = criarAvaliacaoProdutoResumoValida();

    assert.deepEqual(
      parseValido(AvaliacaoProdutoResumoResponseSchema, avaliacao),
      avaliacao,
    );
  });

  it("rejeita campos exclusivos do detalhe", () => {
    esperaInvalidos(AvaliacaoProdutoResumoResponseSchema, [
      {
        ...criarAvaliacaoProdutoResumoValida(),
        comentario: "Não esperado na listagem.",
      },
      {
        ...criarAvaliacaoProdutoResumoValida(),
        recomenda: true,
      },
      {
        ...criarAvaliacaoProdutoResumoValida(),
        updatedAt: "2026-09-27T13:00:00.000Z",
      },
    ]);
  });
});

describe("AvaliacaoProdutoResponseSchema", () => {
  it("aceita o envelope de detalhe", () => {
    const resultado = parseValido(AvaliacaoProdutoResponseSchema, {
      status: 200,
      sucesso: true,
      mensagem: "Avaliação encontrada.",
      dados: criarAvaliacaoProdutoDetalhadaValida(),
    });

    assert.equal(resultado.dados.nota, 5);
  });
});

describe("ListAvaliacoesProdutoResponseSchema", () => {
  it("aceita uma resposta paginada", () => {
    const resultado = parseValido(ListAvaliacoesProdutoResponseSchema, {
      status: 200,
      sucesso: true,
      mensagem: "Avaliações encontradas.",
      dados: [criarAvaliacaoProdutoResumoValida()],
      meta: {
        total: 1,
        pagina: 1,
        ultimaPagina: 1,
        limite: 20,
      },
    });

    assert.equal(resultado.dados.length, 1);
  });

  it("rejeita item ou metadados inválidos", () => {
    esperaInvalidos(ListAvaliacoesProdutoResponseSchema, [
      {
        status: 200,
        sucesso: true,
        mensagem: "Avaliações encontradas.",
        dados: [
          {
            ...criarAvaliacaoProdutoResumoValida(),
            nota: "5",
          },
        ],
        meta: {
          total: 1,
          pagina: 1,
          ultimaPagina: 1,
          limite: 20,
        },
      },
      {
        status: 200,
        sucesso: true,
        mensagem: "Avaliações encontradas.",
        dados: [criarAvaliacaoProdutoResumoValida()],
        meta: {
          total: 21,
          pagina: 1,
          ultimaPagina: 1,
          limite: 20,
        },
      },
    ]);
  });
});
