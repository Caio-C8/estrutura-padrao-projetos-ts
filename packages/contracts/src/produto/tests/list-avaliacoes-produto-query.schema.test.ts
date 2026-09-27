import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../../contract-assertions";
import { ListAvaliacoesProdutoQuerySchema } from "../list-avaliacoes-produto-query.schema";

describe("ListAvaliacoesProdutoQuerySchema", () => {
  it("aplica os defaults da paginação", () => {
    assert.deepEqual(parseValido(ListAvaliacoesProdutoQuerySchema, {}), {
      pagina: 1,
      limite: 20,
    });
  });

  it("normaliza filtros e converte a paginação", () => {
    assert.deepEqual(
      parseValido(ListAvaliacoesProdutoQuerySchema, {
        pagina: "2",
        limite: "10",
        pesquisa: " maria ",
        recomenda: "FALSE",
      }),
      {
        pagina: 2,
        limite: 10,
        pesquisa: "maria",
        recomenda: false,
      },
    );
  });

  it("aceita somente o vocabulário booleano definido", () => {
    const casos = [
      ["true", true],
      ["TRUE", true],
      ["1", true],
      ["false", false],
      ["FALSE", false],
      ["0", false],
    ] as const;

    for (const [entrada, esperado] of casos) {
      const resultado = parseValido(ListAvaliacoesProdutoQuerySchema, {
        recomenda: entrada,
      });

      assert.equal(resultado.recomenda, esperado);
    }
  });

  it("rejeita filtros inválidos e propriedades desconhecidas", () => {
    esperaInvalidos(ListAvaliacoesProdutoQuerySchema, [
      { pesquisa: "" },
      { pesquisa: "   " },
      { pesquisa: "a".repeat(101) },
      { pesquisa: ["maria", "joão"] },
      { recomenda: "sim" },
      { recomenda: "yes" },
      { recomenda: true },
      { recomenda: 1 },
      { filtroInexistente: "valor" },
    ]);
  });
});
