// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StatusProduto, type ProdutoResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { ProdutoDetalhe } from "../produto-detalhe";

const useProdutoMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/produto/api/use-produto", () => ({
  useProduto: useProdutoMock,
}));

vi.mock("../delete-produto-dialog", () => ({
  DeleteProdutoDialog: ({ produtoId }: { produtoId: string }) => (
    <button type="button" data-produto-id={produtoId}>
      Excluir produto
    </button>
  ),
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

const RESPOSTA = {
  status: 200,
  sucesso: true,
  mensagem: "Produto encontrado com sucesso.",
  dados: {
    id: PRODUTO_ID,
    sku: "PRODUTO-001",
    nome: "Notebook profissional",
    descricao: "Notebook destinado ao uso profissional.",
    urlManual: "https://example.com/manual",
    status: StatusProduto.ATIVO,
    emDestaque: true,
    estoque: 10,
    preco: "370.98",
    pesoKg: 1.5,
    quantidadeVendas: "5",
    dataValidade: "2029-10-01",
    disponivelEm: "2026-12-02T10:00:00.000Z",
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
} satisfies ProdutoResponse;

afterEach(() => {
  cleanup();
  useProdutoMock.mockReset();
});

describe("ProdutoDetalhe", () => {
  it("exibe o estado de carregamento", () => {
    useProdutoMock.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isFetching: true,
      isPending: true,
      refetch: vi.fn(),
    });

    render(<ProdutoDetalhe produtoId={PRODUTO_ID} />);

    expect(screen.getByLabelText("Carregando produto")).toBeDefined();
  });

  it("exibe erro recuperável e permite tentar novamente", () => {
    const refetch = vi.fn();

    useProdutoMock.mockReturnValue({
      data: undefined,
      error: new ApiError({
        status: null,
        codigo: "API_INDISPONIVEL",
        mensagem: "Não foi possível conectar com o serviço.",
        categoria: "rede",
        requisicaoId: "requisicao-123",
      }),
      isError: true,
      isFetching: false,
      isPending: false,
      refetch,
    });

    render(<ProdutoDetalhe produtoId={PRODUTO_ID} />);

    expect(
      screen.getByText("Não foi possível carregar o produto"),
    ).toBeDefined();

    expect(screen.getByText("Referência: requisicao-123")).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tentar novamente",
      }),
    );

    expect(refetch).toHaveBeenCalledOnce();
  });

  it("trata produto inexistente separadamente", () => {
    useProdutoMock.mockReturnValue({
      data: undefined,
      error: new ApiError({
        status: 404,
        codigo: "PRODUTO_NAO_ENCONTRADO",
        mensagem: "Produto não encontrado.",
        categoria: "http",
      }),
      isError: true,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    });

    render(<ProdutoDetalhe produtoId={PRODUTO_ID} />);

    expect(
      screen.getByRole("heading", {
        name: "Produto não encontrado",
      }),
    ).toBeDefined();

    expect(
      screen.getByRole("link", {
        name: "Voltar para produtos",
      }),
    ).toBeDefined();

    expect(
      screen.queryByRole("button", {
        name: "Tentar novamente",
      }),
    ).toBeNull();
  });

  it("exibe todas as informações do produto", () => {
    useProdutoMock.mockReturnValue({
      data: RESPOSTA,
      error: null,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    });

    render(<ProdutoDetalhe produtoId={PRODUTO_ID} />);

    expect(
      screen.getByRole("heading", {
        name: "Notebook profissional",
      }),
    ).toBeDefined();

    expect(screen.getByText("PRODUTO-001")).toBeDefined();
    expect(screen.getByText("Ativo")).toBeDefined();

    expect(
      screen.getByText("Notebook destinado ao uso profissional."),
    ).toBeDefined();

    const manual = screen.getByRole("link", {
      name: "Abrir manual em nova aba",
    });

    expect(manual.getAttribute("href")).toBe("https://example.com/manual");

    expect(manual.getAttribute("target")).toBe("_blank");
    expect(manual.getAttribute("rel")).toContain("noopener");

    const editarProduto = screen.getByRole("link", {
      name: "Editar produto",
    });

    expect(editarProduto.getAttribute("href")).toBe(
      `/produtos/${PRODUTO_ID}/editar`,
    );

    const excluirProduto = screen.getByRole("button", {
      name: "Excluir produto",
    });

    expect(excluirProduto.getAttribute("data-produto-id")).toBe(PRODUTO_ID);
  });
});
