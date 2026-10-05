import { StatusProduto } from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { produtoQueryKeys } from "../produto-query-keys";

describe("produtoQueryKeys", () => {
  it("cria a chave raiz do domínio", () => {
    expect(produtoQueryKeys.raiz).toEqual(["produtos"]);
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
});
