import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AvaliacaoProdutoDetalhadoResponseSchema,
  AvaliacaoProdutoParamsSchema,
  AvaliacaoProdutoResponseSchema,
  AvaliacaoProdutoResumoResponseSchema,
  CreateAvaliacaoProdutoSchema,
  CreateProdutoSchema,
  ErroCampoSchema,
  ListAvaliacoesProdutoQuerySchema,
  ListAvaliacoesProdutoResponseSchema,
  ListProdutosQuerySchema,
  ListProdutosResponseSchema,
  MetaPaginacaoSchema,
  PaginacaoQuerySchema,
  ProdutoAvaliacoesParamsSchema,
  ProdutoDetalhadoResponseSchema,
  ProdutoParamsSchema,
  ProdutoResponseSchema,
  ProdutoResumoResponseSchema,
  RespostaErroSchema,
  StatusProdutoSchema,
  UpdateAvaliacaoProdutoSchema,
  UpdateProdutoSchema,
  criarRespostaSucessoPaginadaSchema,
  criarRespostaSucessoSchema,
} from "./index";

describe("@repo/contracts — API pública", () => {
  it("exporta os schemas públicos de Produto e respostas", () => {
    const schemas = [
      StatusProdutoSchema,
      ProdutoParamsSchema,
      CreateProdutoSchema,
      UpdateProdutoSchema,
      ListProdutosQuerySchema,
      ProdutoDetalhadoResponseSchema,
      ProdutoResumoResponseSchema,
      ProdutoResponseSchema,
      ListProdutosResponseSchema,
      MetaPaginacaoSchema,
      ErroCampoSchema,
      RespostaErroSchema,
      PaginacaoQuerySchema,
      ProdutoAvaliacoesParamsSchema,
      AvaliacaoProdutoParamsSchema,
      CreateAvaliacaoProdutoSchema,
      UpdateAvaliacaoProdutoSchema,
      ListAvaliacoesProdutoQuerySchema,
      AvaliacaoProdutoDetalhadoResponseSchema,
      AvaliacaoProdutoResumoResponseSchema,
      AvaliacaoProdutoResponseSchema,
      ListAvaliacoesProdutoResponseSchema,
    ];

    for (const schema of schemas) {
      assert.equal(typeof schema.safeParse, "function");
    }

    assert.equal(typeof criarRespostaSucessoSchema, "function");
    assert.equal(typeof criarRespostaSucessoPaginadaSchema, "function");
  });
});
