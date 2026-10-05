// @vitest-environment jsdom

import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ProdutosFiltros } from "../produtos-filtros";

vi.mock("next/form", () => ({
  default: ({ action, ...props }: ComponentProps<"form">) => (
    <form action={action} {...props} />
  ),
}));

afterEach(() => {
  cleanup();
});

const VALORES_PADRAO = {
  pesquisa: "",
  status: "",
  emDestaque: "",
  limite: "20",
};

describe("ProdutosFiltros", () => {
  it("associa a mensagem ao campo inválido", () => {
    render(
      <ProdutosFiltros
        valores={{
          ...VALORES_PADRAO,
          status: "INEXISTENTE",
        }}
        erros={[
          {
            campo: "status",
            codigo: "FILTRO_URL_INVALIDO",
            mensagem: "Selecione um status válido para o produto.",
          },
        ]}
      />,
    );

    const status = screen.getByLabelText("Status");
    const mensagem = screen.getByText(
      "Selecione um status válido para o produto.",
    );

    expect(status.getAttribute("aria-invalid")).toBe("true");
    expect(status.getAttribute("aria-describedby")).toBe("status-erro");
    expect(mensagem.id).toBe("status-erro");
  });

  it("não marca campos válidos como inválidos", () => {
    render(<ProdutosFiltros valores={VALORES_PADRAO} />);

    expect(
      screen.getByLabelText("Pesquisa").getAttribute("aria-invalid"),
    ).toBeNull();

    expect(
      screen.getByLabelText("Status").getAttribute("aria-invalid"),
    ).toBeNull();

    expect(
      screen.getByLabelText("Destaque").getAttribute("aria-invalid"),
    ).toBeNull();
  });

  it("exibe erro geral para parâmetros sem controle visível", () => {
    render(
      <ProdutosFiltros
        valores={VALORES_PADRAO}
        erros={[
          {
            campo: "pagina",
            codigo: "FILTRO_URL_INVALIDO",
            mensagem: "A página deve ser maior ou igual a 1.",
          },
        ]}
      />,
    );

    expect(
      screen.getByText("Alguns parâmetros da URL são inválidos:"),
    ).toBeDefined();

    expect(
      screen.getByText("A página deve ser maior ou igual a 1."),
    ).toBeDefined();
  });

  it("mantém os valores informados após erro", () => {
    render(
      <ProdutosFiltros
        valores={{
          pesquisa: "notebook",
          status: "ATIVO",
          emDestaque: "true",
          limite: "10",
        }}
      />,
    );

    expect((screen.getByLabelText("Pesquisa") as HTMLInputElement).value).toBe(
      "notebook",
    );

    expect((screen.getByLabelText("Status") as HTMLSelectElement).value).toBe(
      "ATIVO",
    );

    expect((screen.getByLabelText("Destaque") as HTMLSelectElement).value).toBe(
      "true",
    );

    expect(
      (screen.getByLabelText("Itens por página") as HTMLSelectElement).value,
    ).toBe("10");
  });
});
