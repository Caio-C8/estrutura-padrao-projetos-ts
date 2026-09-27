import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../../contract-assertions";
import {
  AutorNomeAvaliacaoProdutoSchema,
  ComentarioAvaliacaoProdutoSchema,
  NotaAvaliacaoProdutoSchema,
} from "../avaliacao-produto-fields.schema";

describe("AutorNomeAvaliacaoProdutoSchema", () => {
  it("aplica trim e aceita o limite", () => {
    assert.equal(
      parseValido(AutorNomeAvaliacaoProdutoSchema, " Maria "),
      "Maria",
    );

    assert.equal(
      parseValido(AutorNomeAvaliacaoProdutoSchema, "a".repeat(80)),
      "a".repeat(80),
    );
  });

  it("rejeita valores inválidos", () => {
    esperaInvalidos(AutorNomeAvaliacaoProdutoSchema, [
      "",
      "   ",
      "a".repeat(81),
      123,
      null,
      undefined,
    ]);
  });
});

describe("NotaAvaliacaoProdutoSchema", () => {
  it("aceita inteiros entre 1 e 5", () => {
    for (const nota of [1, 2, 3, 4, 5]) {
      assert.equal(parseValido(NotaAvaliacaoProdutoSchema, nota), nota);
    }
  });

  it("rejeita valores fora do intervalo ou de tipo incorreto", () => {
    esperaInvalidos(NotaAvaliacaoProdutoSchema, [
      0,
      6,
      1.5,
      "5",
      Number.NaN,
      Number.POSITIVE_INFINITY,
      null,
      undefined,
    ]);
  });
});

describe("ComentarioAvaliacaoProdutoSchema", () => {
  it("aplica trim e aceita o limite", () => {
    assert.equal(
      parseValido(ComentarioAvaliacaoProdutoSchema, " Excelente "),
      "Excelente",
    );

    assert.equal(
      parseValido(ComentarioAvaliacaoProdutoSchema, "a".repeat(1_000)),
      "a".repeat(1_000),
    );
  });

  it("rejeita valores inválidos", () => {
    esperaInvalidos(ComentarioAvaliacaoProdutoSchema, [
      "",
      "   ",
      "a".repeat(1_001),
      123,
      null,
      undefined,
    ]);
  });
});
