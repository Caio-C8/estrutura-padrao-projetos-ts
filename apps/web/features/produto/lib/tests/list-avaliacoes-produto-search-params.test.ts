import { describe, expect, it } from "vitest";
import { lerAvaliacoesProdutoSearchParams } from "../list-avaliacoes-produto-search-params";

describe("lerAvaliacoesProdutoSearchParams", () => {
  it("aplica os valores padrão", () => {
    const resultado = lerAvaliacoesProdutoSearchParams({});

    expect(resultado).toEqual({
      sucesso: true,
      valores: {
        pagina: "1",
        limite: "20",
        pesquisa: "",
        recomenda: "",
      },
      query: {
        pagina: "1",
        limite: "20",
        pesquisa: undefined,
        recomenda: undefined,
      },
    });
  });

  it("normaliza paginação, pesquisa e recomendação", () => {
    const resultado = lerAvaliacoesProdutoSearchParams({
      pagina: "02",
      limite: "10",
      pesquisa: "  maria  ",
      recomenda: "FALSE",
    });

    expect(resultado).toEqual({
      sucesso: true,
      valores: {
        pagina: "2",
        limite: "10",
        pesquisa: "maria",
        recomenda: "false",
      },
      query: {
        pagina: "2",
        limite: "10",
        pesquisa: "maria",
        recomenda: "false",
      },
    });
  });

  it("trata filtros opcionais vazios como ausentes", () => {
    const resultado = lerAvaliacoesProdutoSearchParams({
      pagina: "1",
      limite: "20",
      pesquisa: "",
      recomenda: "",
    });

    expect(resultado).toEqual({
      sucesso: true,
      valores: {
        pagina: "1",
        limite: "20",
        pesquisa: "",
        recomenda: "",
      },
      query: {
        pagina: "1",
        limite: "20",
        pesquisa: undefined,
        recomenda: undefined,
      },
    });
  });

  it("preserva os valores recebidos quando os filtros são inválidos", () => {
    const resultado = lerAvaliacoesProdutoSearchParams({
      pagina: "0",
      limite: "100",
      pesquisa: "maria",
      recomenda: "todos",
    });

    expect(resultado.sucesso).toBe(false);

    if (resultado.sucesso) {
      throw new Error("Era esperado um resultado inválido.");
    }

    expect(resultado.valores).toEqual({
      pagina: "0",
      limite: "100",
      pesquisa: "maria",
      recomenda: "todos",
    });

    expect(resultado.erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          campo: "pagina",
          codigo: "FILTRO_INVALIDO",
        }),
        expect.objectContaining({
          campo: "limite",
          codigo: "FILTRO_INVALIDO",
        }),
        expect.objectContaining({
          campo: "recomenda",
          codigo: "FILTRO_INVALIDO",
        }),
      ]),
    );
  });

  it("rejeita parâmetros repetidos", () => {
    const resultado = lerAvaliacoesProdutoSearchParams({
      pagina: ["1", "2"],
      pesquisa: ["maria", "joão"],
    });

    expect(resultado.sucesso).toBe(false);

    if (resultado.sucesso) {
      throw new Error("Era esperado um resultado inválido.");
    }

    expect(resultado.erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          campo: "pagina",
          codigo: "FILTRO_INVALIDO",
        }),
        expect.objectContaining({
          campo: "pesquisa",
          codigo: "FILTRO_INVALIDO",
        }),
      ]),
    );
  });

  it("normaliza representações equivalentes do filtro recomenda", () => {
    const casos = [
      ["true", "true"],
      ["TRUE", "true"],
      ["1", "true"],
      ["false", "false"],
      ["FALSE", "false"],
      ["0", "false"],
    ] as const;

    for (const [entrada, esperado] of casos) {
      const resultado = lerAvaliacoesProdutoSearchParams({
        recomenda: entrada,
      });

      expect(resultado.sucesso).toBe(true);

      if (!resultado.sucesso) {
        throw new Error(`O valor ${entrada} deveria ser válido.`);
      }

      expect(resultado.query.recomenda).toBe(esperado);
      expect(resultado.valores.recomenda).toBe(esperado);
    }
  });

  it("rejeita limites que não são oferecidos pela interface", () => {
    const resultado = lerAvaliacoesProdutoSearchParams({
      limite: "15",
    });

    expect(resultado.sucesso).toBe(false);

    if (resultado.sucesso) {
      throw new Error("Era esperado um resultado inválido.");
    }

    expect(resultado.valores.limite).toBe("15");

    expect(resultado.erros).toEqual([
      {
        campo: "limite",
        codigo: "FILTRO_INVALIDO",
        mensagem: "Selecione 10, 20 ou 50 avaliações por página.",
      },
    ]);
  });
});
