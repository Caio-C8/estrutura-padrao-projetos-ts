import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  esperaInvalido,
  esperaInvalidos,
  parseValido,
} from "../../contract-assertions";
import { UpdateAvaliacaoProdutoSchema } from "../update-avaliacao-produto.schema";

describe("UpdateAvaliacaoProdutoSchema", () => {
  it("atualiza somente os campos informados e não aplica defaults", () => {
    assert.deepEqual(
      parseValido(UpdateAvaliacaoProdutoSchema, {
        autorNome: " Maria ",
      }),
      {
        autorNome: "Maria",
      },
    );
  });

  it("aceita false, nota mínima e limpeza explícita do comentário", () => {
    assert.deepEqual(
      parseValido(UpdateAvaliacaoProdutoSchema, {
        nota: 1,
        comentario: null,
        recomenda: false,
      }),
      {
        nota: 1,
        comentario: null,
        recomenda: false,
      },
    );
  });

  it("rejeita objeto vazio ou somente propriedades undefined", () => {
    esperaInvalido(UpdateAvaliacaoProdutoSchema, {});

    esperaInvalido(UpdateAvaliacaoProdutoSchema, {
      comentario: undefined,
    });
  });

  it("rejeita null e valores inválidos nos campos não anuláveis", () => {
    esperaInvalidos(UpdateAvaliacaoProdutoSchema, [
      { autorNome: null },
      { nota: null },
      { recomenda: null },
      { autorNome: "" },
      { nota: 0 },
      { nota: 6 },
      { comentario: "" },
      { comentario: "   " },
    ]);
  });

  it("rejeita campos controlados pelo servidor ou pelo path", () => {
    esperaInvalidos(UpdateAvaliacaoProdutoSchema, [
      { produtoId: "875035dc-7f98-4096-b062-11b72d07c427" },
      { id: "2b3251d8-a040-45a0-839f-8970b4a395cf" },
      { updatedAt: "2026-09-27T12:00:00.000Z" },
    ]);
  });
});
