import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../test-utils";
import { PRODUTO_ID_VALIDO } from "./produto.fixtures";
import { ProdutoParamsSchema } from "./produto-params.schema";

describe("ProdutoParamsSchema", () => {
  it("aceita um UUID válido", () => {
    assert.deepEqual(
      parseValido(ProdutoParamsSchema, {
        id: PRODUTO_ID_VALIDO,
      }),
      {
        id: PRODUTO_ID_VALIDO,
      },
    );
  });

  it("rejeita identificadores inválidos ou ausentes", () => {
    esperaInvalidos(ProdutoParamsSchema, [
      {},
      { id: "" },
      { id: "produto-1" },
      { id: ` ${PRODUTO_ID_VALIDO} ` },
      { id: 123 },
      { id: null },
    ]);
  });

  it("rejeita propriedades inesperadas", () => {
    esperaInvalidos(ProdutoParamsSchema, [
      {
        id: PRODUTO_ID_VALIDO,
        outroParametro: "valor",
      },
    ]);
  });
});
