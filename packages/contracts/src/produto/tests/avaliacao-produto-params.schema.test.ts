import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../../contract-assertions";
import {
  AvaliacaoProdutoParamsSchema,
  ProdutoAvaliacoesParamsSchema,
} from "../avaliacao-produto-params.schema";

const PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";
const AVALIACAO_ID = "2b3251d8-a040-45a0-839f-8970b4a395cf";

describe("ProdutoAvaliacoesParamsSchema", () => {
  it("aceita o ID do produto", () => {
    assert.deepEqual(
      parseValido(ProdutoAvaliacoesParamsSchema, {
        produtoId: PRODUTO_ID,
      }),
      {
        produtoId: PRODUTO_ID,
      },
    );
  });

  it("rejeita params inválidos", () => {
    esperaInvalidos(ProdutoAvaliacoesParamsSchema, [
      {},
      { produtoId: "produto-1" },
      { produtoId: null },
      { produtoId: PRODUTO_ID, avaliacaoId: AVALIACAO_ID },
    ]);
  });
});

describe("AvaliacaoProdutoParamsSchema", () => {
  it("aceita os IDs do produto e da avaliação", () => {
    assert.deepEqual(
      parseValido(AvaliacaoProdutoParamsSchema, {
        produtoId: PRODUTO_ID,
        avaliacaoId: AVALIACAO_ID,
      }),
      {
        produtoId: PRODUTO_ID,
        avaliacaoId: AVALIACAO_ID,
      },
    );
  });

  it("rejeita IDs ausentes, inválidos ou propriedades desconhecidas", () => {
    esperaInvalidos(AvaliacaoProdutoParamsSchema, [
      {},
      { produtoId: PRODUTO_ID },
      { avaliacaoId: AVALIACAO_ID },
      { produtoId: "produto-1", avaliacaoId: AVALIACAO_ID },
      { produtoId: PRODUTO_ID, avaliacaoId: "avaliacao-1" },
      {
        produtoId: PRODUTO_ID,
        avaliacaoId: AVALIACAO_ID,
        outroCampo: "valor",
      },
    ]);
  });
});
