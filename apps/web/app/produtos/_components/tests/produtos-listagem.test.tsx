// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StatusProduto, type ListProdutosResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { ProdutosListagem } from "../produtos-listagem";

const useProdutosMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/produto/api/use-produtos", () => ({
  useProdutos: useProdutosMock,
}));

const PRODUTO = {
  id: "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4",
  sku: "PRODUTO-001",
  nome: "Notebook profissional",
  status: StatusProduto.ATIVO,
  emDestaque: true,
  estoque: 10,
  preco: "370.98",
  pesoKg: 1.5,
  quantidadeVendas: "5",
  dataValidade: null,
  disponivelEm: null,
  createdAt: "2026-10-01T10:00:00.000Z",
  updatedAt: "2026-10-01T10:00:00.000Z",
} as const;

const RESPOSTA_COM_PRODUTO = {
  status: 200,
  sucesso: true,
  mensagem: "Produtos listados com sucesso.",
  dados: [PRODUTO],
  meta: {
    total: 11,
    pagina: 1,
    ultimaPagina: 2,
    limite: 10,
  },
} satisfies ListProdutosResponse;

const QUERY = {
  pagina: "1",
  limite: "10",
  pesquisa: "produto",
  status: StatusProduto.ATIVO,
  emDestaque: "false",
};

afterEach(() => {
  cleanup();
  useProdutosMock.mockReset();
});

describe("ProdutosListagem", () => {
  it("exibe o estado de carregamento", () => {
    useProdutosMock.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isFetching: true,
      isPending: true,
      refetch: vi.fn(),
    });

    render(<ProdutosListagem query={QUERY} />);

    expect(screen.getByLabelText("Carregando produtos")).toBeDefined();
  });

  it("exibe erro e permite tentar novamente", () => {
    const refetch = vi.fn();

    useProdutosMock.mockReturnValue({
      data: undefined,
      error: new ApiError({
        status: null,
        codigo: "API_INDISPONIVEL",
        mensagem: "Não foi possível conectar com o serviço.",
        categoria: "rede",
      }),
      isError: true,
      isFetching: false,
      isPending: false,
      refetch,
    });

    render(<ProdutosListagem query={QUERY} />);

    expect(screen.getByRole("alert")).toBeDefined();

    expect(
      screen.getByText("Não foi possível conectar com o serviço."),
    ).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tentar novamente",
      }),
    );

    expect(refetch).toHaveBeenCalledOnce();
  });

  it("exibe o estado vazio", () => {
    useProdutosMock.mockReturnValue({
      data: {
        status: 200,
        sucesso: true,
        mensagem: "Produtos listados com sucesso.",
        dados: [],
        meta: {
          total: 0,
          pagina: 1,
          ultimaPagina: 1,
          limite: 20,
        },
      },
      error: null,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    });

    render(<ProdutosListagem query={QUERY} />);

    expect(screen.getByText("Nenhum produto encontrado")).toBeDefined();
  });

  it("renderiza os produtos e a paginação", () => {
    useProdutosMock.mockReturnValue({
      data: RESPOSTA_COM_PRODUTO,
      error: null,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    });

    render(<ProdutosListagem query={QUERY} />);

    // O produto existe na versão mobile e na tabela desktop.
    expect(screen.getAllByText("Notebook profissional")).toHaveLength(2);

    expect(screen.getByText("11 produtos")).toBeDefined();

    expect(screen.getByText("Página 1 de 2")).toBeDefined();

    const proximaPagina = screen.getByRole("link", {
      name: "Próxima",
    });

    expect(proximaPagina.getAttribute("href")).toBe(
      "/produtos?pagina=2&limite=10&pesquisa=produto&status=ATIVO&emDestaque=false",
    );
  });

  it("informa quando uma página válida não possui itens", () => {
    useProdutosMock.mockReturnValue({
      data: {
        ...RESPOSTA_COM_PRODUTO,
        dados: [],
        meta: {
          total: 11,
          pagina: 2,
          ultimaPagina: 2,
          limite: 10,
        },
      },
      error: null,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    });

    render(<ProdutosListagem query={QUERY} />);

    expect(
      screen.getByText("Esta página não possui resultados."),
    ).toBeDefined();
  });
});
