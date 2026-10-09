// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AvaliacoesProdutoFiltros } from "../avaliacoes-produto-filtros";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

afterEach(() => {
  cleanup();
});

describe("AvaliacoesProdutoFiltros", () => {
  it("renderiza os valores atuais dos filtros", () => {
    render(
      <AvaliacoesProdutoFiltros
        produtoId={PRODUTO_ID}
        valores={{
          pagina: "2",
          limite: "10",
          pesquisa: "maria",
          recomenda: "true",
        }}
        erros={[]}
      />,
    );

    const form = screen.getByRole("form", {
      name: "Filtros das avaliações",
    });

    expect(form.getAttribute("method")).toBe("get");

    expect(form.getAttribute("action")).toBe(
      `/produtos/${PRODUTO_ID}/avaliacoes`,
    );

    expect(
      (screen.getByLabelText("Pesquisar autor") as HTMLInputElement).value,
    ).toBe("maria");

    expect(
      (screen.getByLabelText("Recomendação") as HTMLSelectElement).value,
    ).toBe("true");

    expect(
      (screen.getByLabelText("Por página") as HTMLSelectElement).value,
    ).toBe("10");
  });

  it("usa valor vazio para representar todas as recomendações", () => {
    render(
      <AvaliacoesProdutoFiltros
        produtoId={PRODUTO_ID}
        valores={{
          pagina: "1",
          limite: "20",
          pesquisa: "",
          recomenda: "",
        }}
        erros={[]}
      />,
    );

    const opcaoTodas = screen.getByRole("option", {
      name: "Todas",
    }) as HTMLOptionElement;

    expect(opcaoTodas.value).toBe("");

    expect(
      (screen.getByLabelText("Recomendação") as HTMLSelectElement).value,
    ).toBe("");
  });

  it("associa cada erro ao seu respectivo campo", () => {
    render(
      <AvaliacoesProdutoFiltros
        produtoId={PRODUTO_ID}
        valores={{
          pagina: "1",
          limite: "15",
          pesquisa: "maria",
          recomenda: "todos",
        }}
        erros={[
          {
            campo: "limite",
            codigo: "FILTRO_INVALIDO",
            mensagem: "Selecione 10, 20 ou 50 avaliações por página.",
          },
          {
            campo: "recomenda",
            codigo: "FILTRO_INVALIDO",
            mensagem: "Selecione uma recomendação válida.",
          },
        ]}
      />,
    );

    const limite = screen.getByLabelText("Por página");
    const recomenda = screen.getByLabelText("Recomendação");

    expect(limite.getAttribute("aria-invalid")).toBe("true");
    expect(recomenda.getAttribute("aria-invalid")).toBe("true");

    expect(limite.getAttribute("aria-describedby")).toBe(
      "avaliacoes-limite-erro",
    );

    expect(recomenda.getAttribute("aria-describedby")).toBe(
      "avaliacoes-recomenda-erro",
    );

    expect(
      screen.getByText("Selecione 10, 20 ou 50 avaliações por página."),
    ).toBeDefined();

    expect(
      screen.getByText("Selecione uma recomendação válida."),
    ).toBeDefined();
  });

  it("oferece uma navegação que remove todos os filtros", () => {
    render(
      <AvaliacoesProdutoFiltros
        produtoId={PRODUTO_ID}
        valores={{
          pagina: "2",
          limite: "10",
          pesquisa: "maria",
          recomenda: "true",
        }}
        erros={[]}
      />,
    );

    expect(
      screen
        .getByRole("link", {
          name: "Limpar filtros",
        })
        .getAttribute("href"),
    ).toBe(`/produtos/${PRODUTO_ID}/avaliacoes`);
  });
});
