import { StatusProduto } from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { produtoQueryKeys } from "../produto-query-keys";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

describe("produtoQueryKeys", () => {
  it("cria a chave raiz do domínio", () => {
    expect(produtoQueryKeys.raiz).toEqual(["produtos"]);
  });

  it("cria a chave base das listas", () => {
    expect(produtoQueryKeys.listas()).toEqual(["produtos", "lista"]);
  });

  it("inclui todos os filtros na chave da lista", () => {
    expect(
      produtoQueryKeys.lista({
        pagina: "2",
        limite: "10",
        pesquisa: "notebook",
        status: StatusProduto.ATIVO,
        emDestaque: "true",
      }),
    ).toEqual([
      "produtos",
      "lista",
      {
        pagina: "2",
        limite: "10",
        pesquisa: "notebook",
        status: StatusProduto.ATIVO,
        emDestaque: "true",
      },
    ]);
  });

  it("não mantém a referência mutável recebida", () => {
    const query = {
      pagina: "1",
      pesquisa: "notebook",
    };

    const key = produtoQueryKeys.lista(query);

    query.pagina = "2";

    expect(key[2].pagina).toBe("1");
  });

  it("cria a chave base dos detalhes", () => {
    expect(produtoQueryKeys.detalhes()).toEqual(["produtos", "detalhe"]);
  });

  it("inclui o identificador na chave do detalhe", () => {
    expect(produtoQueryKeys.detalhe(PRODUTO_ID)).toEqual([
      "produtos",
      "detalhe",
      PRODUTO_ID,
    ]);
  });
});
