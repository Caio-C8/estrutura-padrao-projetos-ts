import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalido, esperaInvalidos, parseValido } from "../test-utils";
import {
  criarProdutoDetalhadoValido,
  criarProdutoResumoValido,
} from "./produto.fixtures";
import {
  ListProdutosResponseSchema,
  ProdutoDetalhadoResponseSchema,
  ProdutoResponseSchema,
  ProdutoResumoResponseSchema,
} from "./produto-response.schema";

describe("ProdutoDetalhadoResponseSchema", () => {
  it("aceita a representação serializada completa", () => {
    const produto = criarProdutoDetalhadoValido();

    assert.deepEqual(
      parseValido(ProdutoDetalhadoResponseSchema, produto),
      produto,
    );
  });

  it("aceita null nos campos anuláveis", () => {
    const resultado = parseValido(ProdutoDetalhadoResponseSchema, {
      ...criarProdutoDetalhadoValido(),
      descricao: null,
      urlManual: null,
      pesoKg: null,
      dataValidade: null,
      disponivelEm: null,
    });

    assert.equal(resultado.descricao, null);
    assert.equal(resultado.dataValidade, null);
  });

  it("rejeita representações internas que não atravessam JSON", () => {
    const produto = criarProdutoDetalhadoValido();

    esperaInvalidos(ProdutoDetalhadoResponseSchema, [
      { ...produto, preco: 19.9 },
      { ...produto, preco: "19.9" },
      { ...produto, quantidadeVendas: 100 },
      { ...produto, createdAt: new Date() },
      { ...produto, updatedAt: "2026-09-06T15:00:00-03:00" },
      { ...produto, createdAt: "2026-09-06T15:00:00Z" },
    ]);
  });

  it("rejeita valores fora das regras da resposta", () => {
    const produto = criarProdutoDetalhadoValido();

    esperaInvalidos(ProdutoDetalhadoResponseSchema, [
      { ...produto, id: "produto-1" },
      { ...produto, sku: "produto-001" },
      { ...produto, estoque: -1 },
      { ...produto, quantidadeVendas: "-1" },
      { ...produto, quantidadeVendas: "01" },
      { ...produto, dataValidade: "05/09/2027" },
    ]);
  });

  it("rejeita campos internos inesperados", () => {
    esperaInvalido(ProdutoDetalhadoResponseSchema, {
      ...criarProdutoDetalhadoValido(),
      custoInterno: "10.00",
    });
  });
});

describe("ProdutoResumoResponseSchema", () => {
  it("aceita a representação resumida", () => {
    const produto = criarProdutoResumoValido();

    assert.deepEqual(
      parseValido(ProdutoResumoResponseSchema, produto),
      produto,
    );
  });

  it("rejeita campos que pertencem somente ao detalhe", () => {
    esperaInvalidos(ProdutoResumoResponseSchema, [
      {
        ...criarProdutoResumoValido(),
        descricao: "Descrição não esperada na listagem",
      },
      {
        ...criarProdutoResumoValido(),
        urlManual: "https://example.com/manual.pdf",
      },
    ]);
  });
});

describe("ProdutoResponseSchema", () => {
  it("aceita o envelope de detalhe", () => {
    const resultado = parseValido(ProdutoResponseSchema, {
      status: 200,
      sucesso: true,
      mensagem: "Produto encontrado.",
      dados: criarProdutoDetalhadoValido(),
    });

    assert.equal(resultado.dados.sku, "PRODUTO-001");
  });

  it("rejeita discriminador ou dados inválidos", () => {
    esperaInvalidos(ProdutoResponseSchema, [
      {
        status: 200,
        sucesso: false,
        mensagem: "Produto encontrado.",
        dados: criarProdutoDetalhadoValido(),
      },
      {
        status: 200,
        sucesso: true,
        mensagem: "Produto encontrado.",
        dados: {
          ...criarProdutoDetalhadoValido(),
          preco: 19.9,
        },
      },
    ]);
  });
});

describe("ListProdutosResponseSchema", () => {
  it("aceita uma resposta paginada", () => {
    const resultado = parseValido(ListProdutosResponseSchema, {
      status: 200,
      sucesso: true,
      mensagem: "Produtos encontrados.",
      dados: [criarProdutoResumoValido()],
      meta: {
        total: 1,
        pagina: 1,
        ultimaPagina: 1,
        limite: 20,
      },
    });

    assert.equal(resultado.dados.length, 1);
    assert.equal(resultado.meta.total, 1);
  });

  it("rejeita item ou paginação inválida", () => {
    esperaInvalidos(ListProdutosResponseSchema, [
      {
        status: 200,
        sucesso: true,
        mensagem: "Produtos encontrados.",
        dados: [
          {
            ...criarProdutoResumoValido(),
            preco: 19.9,
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
        mensagem: "Produtos encontrados.",
        dados: [criarProdutoResumoValido()],
        meta: {
          total: 25,
          pagina: 1,
          ultimaPagina: 2,
          limite: 10,
        },
      },
    ]);
  });
});
