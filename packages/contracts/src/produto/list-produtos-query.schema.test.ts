import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { esperaInvalidos, parseValido } from "../contract-assertions";
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
      ["True", true],
      ["TRUE", true],
      ["1", true],
      ["false", false],
      ["False", false],
      ["FALSE", false],
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
      { pagina: true },
      { pagina: false },
      { pagina: [] },
      { pagina: 1 },
      { pagina: " " },
      { pagina: "1.0" },
      { pagina: "1e2" },
      { pagina: "0x10" },
      { pagina: "+1" },
      { limite: "0" },
      { limite: "51" },
      { limite: "1.5" },
      { limite: "abc" },
      { limite: "" },
      { limite: null },
      { limite: true },
      { limite: false },
      { limite: [] },
      { limite: 1 },
      { limite: " " },
      { limite: "1.0" },
      { limite: "1e2" },
      { limite: "0x10" },
      { limite: "+1" },
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
