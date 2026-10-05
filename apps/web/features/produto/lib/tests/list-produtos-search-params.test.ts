import { StatusProduto } from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { lerProdutosSearchParams } from "../list-produtos-search-params";

describe("lerProdutosSearchParams", () => {
  it("aplica e serializa os valores padrão", () => {
    expect(lerProdutosSearchParams({})).toEqual({
      sucesso: true,
      query: {
        pagina: "1",
        limite: "20",
        pesquisa: undefined,
        status: undefined,
        emDestaque: undefined,
      },
      valores: {
        pesquisa: "",
        status: "",
        emDestaque: "",
        limite: "20",
      },
    });
  });

  it("normaliza filtros válidos", () => {
    expect(
      lerProdutosSearchParams({
        pagina: "2",
        limite: "10",
        pesquisa: "  notebook  ",
        status: StatusProduto.ATIVO,
        emDestaque: "false",
      }),
    ).toEqual({
      sucesso: true,
      query: {
        pagina: "2",
        limite: "10",
        pesquisa: "notebook",
        status: StatusProduto.ATIVO,
        emDestaque: "false",
      },
      valores: {
        pesquisa: "notebook",
        status: StatusProduto.ATIVO,
        emDestaque: "false",
        limite: "10",
      },
    });
  });

  it("rejeita valores repetidos", () => {
    const resultado = lerProdutosSearchParams({
      pagina: ["1", "2"],
    });

    expect(resultado.sucesso).toBe(false);

    if (resultado.sucesso) {
      throw new Error("O teste esperava filtros inválidos.");
    }

    expect(resultado.erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          campo: "pagina",
          codigo: "FILTRO_URL_INVALIDO",
        }),
      ]),
    );
  });

  it("não encaminha filtros inválidos", () => {
    const resultado = lerProdutosSearchParams({
      pagina: "0",
      limite: "500",
      status: "INEXISTENTE",
    });

    expect(resultado.sucesso).toBe(false);

    if (resultado.sucesso) {
      throw new Error("O teste esperava filtros inválidos.");
    }

    expect(resultado).not.toHaveProperty("query");
  });

  it("trata filtros opcionais vazios como ausentes", () => {
    expect(
      lerProdutosSearchParams({
        pesquisa: "",
        status: "",
        emDestaque: "",
        limite: "20",
      }),
    ).toEqual({
      sucesso: true,
      query: {
        pagina: "1",
        limite: "20",
        pesquisa: undefined,
        status: undefined,
        emDestaque: undefined,
      },
      valores: {
        pesquisa: "",
        status: "",
        emDestaque: "",
        limite: "20",
      },
    });
  });

  it("mantém pesquisa apenas com espaços como inválida", () => {
    const resultado = lerProdutosSearchParams({
      pesquisa: "   ",
    });

    expect(resultado.sucesso).toBe(false);

    if (resultado.sucesso) {
      throw new Error("O teste esperava filtros inválidos.");
    }

    expect(resultado.erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          campo: "pesquisa",
          codigo: "FILTRO_URL_INVALIDO",
        }),
      ]),
    );
  });

  it("associa erros ao campo correspondente", () => {
    const resultado = lerProdutosSearchParams({
      status: "INEXISTENTE",
      emDestaque: "talvez",
      limite: "100",
    });

    expect(resultado.sucesso).toBe(false);

    if (resultado.sucesso) {
      throw new Error("O teste esperava filtros inválidos.");
    }

    expect(resultado.erros.map((erro) => erro.campo)).toEqual(
      expect.arrayContaining(["status", "emDestaque", "limite"]),
    );
  });

  it("rejeita limite que não pode ser representado pelo controle da interface", () => {
    const resultado = lerProdutosSearchParams({
      pagina: "1",
      limite: "1",
    });

    expect(resultado.sucesso).toBe(false);

    if (resultado.sucesso) {
      throw new Error("O teste esperava filtros inválidos.");
    }

    expect(resultado.valores.limite).toBe("1");

    expect(resultado.erros).toEqual([
      {
        campo: "limite",
        codigo: "FILTRO_URL_INVALIDO",
        mensagem: "Selecione 10, 20 ou 50 itens por página.",
      },
    ]);

    expect(resultado).not.toHaveProperty("query");
  });
});
