import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../../contract-assertions";
import { CreateAvaliacaoProdutoSchema } from "../create-avaliacao-produto.schema";

describe("CreateAvaliacaoProdutoSchema", () => {
  it("normaliza o payload mínimo e aplica o default", () => {
    assert.deepEqual(
      parseValido(CreateAvaliacaoProdutoSchema, {
        autorNome: " Maria ",
        nota: 5,
      }),
      {
        autorNome: "Maria",
        nota: 5,
        recomenda: true,
      },
    );
  });

  it("aceita o payload completo", () => {
    assert.deepEqual(
      parseValido(CreateAvaliacaoProdutoSchema, {
        autorNome: "João",
        nota: 4,
        comentario: " Bom produto ",
        recomenda: false,
      }),
      {
        autorNome: "João",
        nota: 4,
        comentario: "Bom produto",
        recomenda: false,
      },
    );
  });

  it("rejeita campos obrigatórios ausentes ou inválidos", () => {
    esperaInvalidos(CreateAvaliacaoProdutoSchema, [
      { nota: 5 },
      { autorNome: "Maria" },
      { autorNome: "", nota: 5 },
      { autorNome: "Maria", nota: 0 },
      { autorNome: "Maria", nota: 6 },
      { autorNome: "Maria", nota: "5" },
    ]);
  });

  it("distingue ausência, undefined, null e string vazia", () => {
    assert.deepEqual(
      parseValido(CreateAvaliacaoProdutoSchema, {
        autorNome: "Maria",
        nota: 5,
        comentario: undefined,
      }),
      {
        autorNome: "Maria",
        nota: 5,
        comentario: undefined,
        recomenda: true,
      },
    );

    esperaInvalidos(CreateAvaliacaoProdutoSchema, [
      { autorNome: "Maria", nota: 5, comentario: null },
      { autorNome: "Maria", nota: 5, comentario: "" },
      { autorNome: "Maria", nota: 5, comentario: "   " },
    ]);
  });

  it("rejeita campos controlados pelo servidor ou pelo path", () => {
    esperaInvalidos(CreateAvaliacaoProdutoSchema, [
      {
        autorNome: "Maria",
        nota: 5,
        produtoId: "875035dc-7f98-4096-b062-11b72d07c427",
      },
      {
        autorNome: "Maria",
        nota: 5,
        id: "2b3251d8-a040-45a0-839f-8970b4a395cf",
      },
      {
        autorNome: "Maria",
        nota: 5,
        createdAt: "2026-09-27T12:00:00.000Z",
      },
    ]);
  });
});
