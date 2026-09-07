import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../test-utils";
import { ListProdutosQuerySchema } from "./list-produtos-query.schema";
import { StatusProduto } from "./status-produto.schema";

describe("ListProdutosQuerySchema", () => {
  it("aplica os valores padrão na query vazia", () => {
    assert.deepEqual(parseValido(ListProdutosQuerySchema, {}), {
      pagina: 1,
      limite: 20,
    });
  });

  it("converte valores textuais da URL", () => {
    assert.deepEqual(
      parseValido(ListProdutosQuerySchema, {
        pagina: "2",
        limite: "10",
        pesquisa: " produto ",
        status: StatusProduto.ATIVO,
        emDestaque: "false",
      }),
      {
        pagina: 2,
        limite: 10,
        pesquisa: "produto",
        status: StatusProduto.ATIVO,
        emDestaque: false,
      },
    );
  });

  it("aceita os limites da paginação", () => {
    const resultado = parseValido(ListProdutosQuerySchema, {
      pagina: "1",
      limite: "50",
    });

    assert.equal(resultado.pagina, 1);
    assert.equal(resultado.limite, 50);
  });

  it("aceita somente o vocabulário booleano definido", () => {
    const casos = [
      ["true", true],
      ["1", true],
      ["false", false],
      ["0", false],
    ] as const;

    for (const [entrada, esperado] of casos) {
      const resultado = parseValido(ListProdutosQuerySchema, {
        emDestaque: entrada,
      });

      assert.equal(resultado.emDestaque, esperado);
    }

    esperaInvalidos(ListProdutosQuerySchema, [
      { emDestaque: "sim" },
      { emDestaque: "yes" },
      { emDestaque: true },
      { emDestaque: 1 },
    ]);
  });

  it("rejeita paginação inválida", () => {
    esperaInvalidos(ListProdutosQuerySchema, [
      { pagina: "0" },
      { pagina: "-1" },
      { pagina: "1.5" },
      { pagina: "abc" },
      { pagina: "" },
      { pagina: null },
      { limite: "0" },
      { limite: "51" },
      { limite: "1.5" },
      { limite: "abc" },
      { limite: "" },
      { limite: null },
    ]);
  });

  it("rejeita filtros inválidos", () => {
    esperaInvalidos(ListProdutosQuerySchema, [
      { pesquisa: "" },
      { pesquisa: "   " },
      { pesquisa: "a".repeat(101) },
      { pesquisa: ["produto", "outro"] },
      { status: "EXCLUIDO" },
      { status: null },
    ]);
  });

  it("rejeita parâmetros desconhecidos", () => {
    esperaInvalidos(ListProdutosQuerySchema, [
      {
        pagina: "1",
        filtroInexistente: "valor",
      },
    ]);
  });
});
