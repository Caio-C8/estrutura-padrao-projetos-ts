import { describe, expect, it } from "vitest";
import { avaliacaoProdutoQueryKeys } from "../avaliacao-produto-query-keys";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const OUTRO_PRODUTO_ID = "487ac091-f816-4b6c-a69f-63bdfed9c853";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

describe("avaliacaoProdutoQueryKeys", () => {
  it("inclui o produto na chave raiz das avaliações", () => {
    expect(avaliacaoProdutoQueryKeys.raiz(PRODUTO_ID)).toEqual([
      "produtos",
      PRODUTO_ID,
      "avaliacoes",
    ]);
  });

  it("isola avaliações pertencentes a produtos diferentes", () => {
    expect(avaliacaoProdutoQueryKeys.raiz(PRODUTO_ID)).not.toEqual(
      avaliacaoProdutoQueryKeys.raiz(OUTRO_PRODUTO_ID),
    );
  });

  it("cria a chave base das listas do produto", () => {
    expect(avaliacaoProdutoQueryKeys.listas(PRODUTO_ID)).toEqual([
      "produtos",
      PRODUTO_ID,
      "avaliacoes",
      "lista",
    ]);
  });

  it("inclui todos os filtros na chave da lista", () => {
    expect(
      avaliacaoProdutoQueryKeys.lista(PRODUTO_ID, {
        pagina: "2",
        limite: "10",
        pesquisa: "maria",
        recomenda: "false",
      }),
    ).toEqual([
      "produtos",
      PRODUTO_ID,
      "avaliacoes",
      "lista",
      {
        pagina: "2",
        limite: "10",
        pesquisa: "maria",
        recomenda: "false",
      },
    ]);
  });

  it("não mantém a referência mutável recebida", () => {
    const query = {
      pagina: "1",
      pesquisa: "maria",
      recomenda: "true",
    };

    const key = avaliacaoProdutoQueryKeys.lista(PRODUTO_ID, query);

    query.pagina = "2";
    query.pesquisa = "joão";
    query.recomenda = "false";

    expect(key[4]).toEqual({
      pagina: "1",
      limite: undefined,
      pesquisa: "maria",
      recomenda: "true",
    });
  });

  it("cria a chave base dos detalhes do produto", () => {
    expect(avaliacaoProdutoQueryKeys.detalhes(PRODUTO_ID)).toEqual([
      "produtos",
      PRODUTO_ID,
      "avaliacoes",
      "detalhe",
    ]);
  });

  it("inclui produtoId e avaliacaoId na chave do detalhe", () => {
    expect(avaliacaoProdutoQueryKeys.detalhe(PRODUTO_ID, AVALIACAO_ID)).toEqual(
      ["produtos", PRODUTO_ID, "avaliacoes", "detalhe", AVALIACAO_ID],
    );
  });

  it("não compartilha detalhes iguais entre produtos diferentes", () => {
    expect(
      avaliacaoProdutoQueryKeys.detalhe(PRODUTO_ID, AVALIACAO_ID),
    ).not.toEqual(
      avaliacaoProdutoQueryKeys.detalhe(OUTRO_PRODUTO_ID, AVALIACAO_ID),
    );
  });
});
