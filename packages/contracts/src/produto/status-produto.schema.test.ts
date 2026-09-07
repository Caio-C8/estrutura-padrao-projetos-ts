import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../test-utils";
import { StatusProduto, StatusProdutoSchema } from "./status-produto.schema";

describe("StatusProdutoSchema", () => {
  it("aceita todos os valores conhecidos", () => {
    for (const status of Object.values(StatusProduto)) {
      assert.equal(parseValido(StatusProdutoSchema, status), status);
    }
  });

  it("rejeita valores que não pertencem ao enum", () => {
    esperaInvalidos(StatusProdutoSchema, [
      "",
      "ativo",
      "EXCLUIDO",
      1,
      true,
      null,
      undefined,
    ]);
  });
});
