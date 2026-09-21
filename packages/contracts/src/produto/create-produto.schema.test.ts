import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  esperaInvalido,
  esperaInvalidos,
  parseValido,
} from "../contract-assertions";
import { CreateProdutoSchema } from "./create-produto.schema";
import { criarProdutoMinimoValido } from "./produto.fixtures";
import { StatusProduto } from "./status-produto.schema";

describe("CreateProdutoSchema", () => {
  it("valida o payload mínimo, normaliza e aplica defaults", () => {
    assert.deepEqual(
      parseValido(CreateProdutoSchema, criarProdutoMinimoValido()),
      {
        sku: "PRODUTO-001",
        nome: "Produto de exemplo",
        preco: "19.90",
        status: StatusProduto.RASCUNHO,
        emDestaque: true,
        estoque: 0,
      },
    );
  });

  it("aceita um payload completo", () => {
    const resultado = parseValido(CreateProdutoSchema, {
      sku: "PRODUTO-002",
      nome: "Produto completo",
      descricao: "Descrição do produto",
      urlManual: "https://example.com/manual.pdf",
      status: StatusProduto.ATIVO,
      emDestaque: false,
      estoque: 10,
      preco: "9999999999.99",
      pesoKg: 1.5,
      dataValidade: "2027-09-05",
      disponivelEm: "2026-09-05T10:00:00-03:00",
    });

    assert.equal(resultado.status, StatusProduto.ATIVO);
    assert.equal(resultado.emDestaque, false);
    assert.equal(resultado.estoque, 10);
  });

  it("rejeita campos obrigatórios ausentes", () => {
    for (const campo of ["sku", "nome", "preco"]) {
      const payload: Record<string, unknown> = {
        ...criarProdutoMinimoValido(),
      };

      delete payload[campo];

      esperaInvalido(CreateProdutoSchema, payload, campo);
    }
  });

  it("aceita campos opcionais ausentes ou undefined", () => {
    const resultado = parseValido(CreateProdutoSchema, {
      ...criarProdutoMinimoValido(),
      descricao: undefined,
      urlManual: undefined,
      pesoKg: undefined,
      dataValidade: undefined,
      disponivelEm: undefined,
    });

    assert.equal(resultado.descricao, undefined);
    assert.equal(resultado.urlManual, undefined);
  });

  it("rejeita null e string vazia nos opcionais", () => {
    esperaInvalidos(CreateProdutoSchema, [
      { ...criarProdutoMinimoValido(), descricao: null },
      { ...criarProdutoMinimoValido(), descricao: "" },
      { ...criarProdutoMinimoValido(), urlManual: null },
      { ...criarProdutoMinimoValido(), pesoKg: null },
      { ...criarProdutoMinimoValido(), dataValidade: null },
      { ...criarProdutoMinimoValido(), disponivelEm: null },
    ]);
  });

  it("rejeita tipos e valores inválidos", () => {
    esperaInvalidos(CreateProdutoSchema, [
      { ...criarProdutoMinimoValido(), emDestaque: "true" },
      { ...criarProdutoMinimoValido(), estoque: -1 },
      { ...criarProdutoMinimoValido(), estoque: 1.5 },
      { ...criarProdutoMinimoValido(), status: "EXCLUIDO" },
      { ...criarProdutoMinimoValido(), preco: "19,90" },
    ]);
  });

  it("rejeita campos controlados pelo servidor", () => {
    esperaInvalidos(CreateProdutoSchema, [
      {
        ...criarProdutoMinimoValido(),
        id: "875035dc-7f98-4096-b062-11b72d07c427",
      },
      {
        ...criarProdutoMinimoValido(),
        quantidadeVendas: "100",
      },
      {
        ...criarProdutoMinimoValido(),
        createdAt: "2026-09-05T12:00:00.000Z",
      },
    ]);
  });
});
