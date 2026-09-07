import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalido, esperaInvalidos, parseValido } from "../test-utils";
import { StatusProduto } from "./status-produto.schema";
import { UpdateProdutoSchema } from "./update-produto.schema";

describe("UpdateProdutoSchema", () => {
  it("atualiza somente os campos informados e não aplica defaults", () => {
    assert.deepEqual(
      parseValido(UpdateProdutoSchema, {
        nome: " Novo nome ",
      }),
      {
        nome: "Novo nome",
      },
    );
  });

  it("aceita múltiplos campos válidos", () => {
    const resultado = parseValido(UpdateProdutoSchema, {
      sku: " produto-002 ",
      status: StatusProduto.DESCONTINUADO,
      emDestaque: false,
      estoque: 0,
      preco: "10.00",
    });

    assert.deepEqual(resultado, {
      sku: "PRODUTO-002",
      status: StatusProduto.DESCONTINUADO,
      emDestaque: false,
      estoque: 0,
      preco: "10.00",
    });
  });

  it("permite limpar explicitamente campos anuláveis", () => {
    const resultado = parseValido(UpdateProdutoSchema, {
      descricao: null,
      urlManual: null,
      pesoKg: null,
      dataValidade: null,
      disponivelEm: null,
    });

    assert.deepEqual(resultado, {
      descricao: null,
      urlManual: null,
      pesoKg: null,
      dataValidade: null,
      disponivelEm: null,
    });
  });

  it("distingue objeto vazio, undefined, null e string vazia", () => {
    esperaInvalido(UpdateProdutoSchema, {}, "");

    esperaInvalido(
      UpdateProdutoSchema,
      {
        descricao: undefined,
      },
      "",
    );

    assert.deepEqual(
      parseValido(UpdateProdutoSchema, {
        descricao: null,
      }),
      {
        descricao: null,
      },
    );

    esperaInvalido(
      UpdateProdutoSchema,
      {
        descricao: "",
      },
      "descricao",
    );
  });

  it("rejeita null em campos não anuláveis", () => {
    for (const campo of [
      "sku",
      "nome",
      "status",
      "emDestaque",
      "estoque",
      "preco",
    ]) {
      esperaInvalido(UpdateProdutoSchema, { [campo]: null }, campo);
    }
  });

  it("rejeita valores inválidos", () => {
    esperaInvalidos(UpdateProdutoSchema, [
      { estoque: -1 },
      { estoque: 1.5 },
      { preco: "19,90" },
      { pesoKg: 0 },
      { status: "EXCLUIDO" },
      { dataValidade: "2027-09-05T00:00:00Z" },
      { disponivelEm: "2027-09-05T00:00:00" },
    ]);
  });

  it("rejeita campos controlados pelo servidor", () => {
    esperaInvalidos(UpdateProdutoSchema, [
      {
        id: "875035dc-7f98-4096-b062-11b72d07c427",
      },
      {
        quantidadeVendas: "100",
      },
      {
        updatedAt: "2026-09-06T15:00:00.000Z",
      },
    ]);
  });
});
