// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StatusProduto, type ProdutoResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { EditarProduto } from "../editar-produto";

const useProdutoMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/produto/api/use-produto", () => ({
  useProduto: useProdutoMock,
}));

vi.mock("../update-produto-form", () => ({
  UpdateProdutoForm: ({
    produto,
  }: {
    produto: {
      nome: string;
    };
  }) => <div data-testid="formulario-edicao">{produto.nome}</div>,
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
    descricao: null,
    urlManual: null,
    status: StatusProduto.ATIVO,
    emDestaque: true,
    estoque: 10,
    preco: "370.98",
    pesoKg: null,
    quantidadeVendas: "0",
    dataValidade: null,
    disponivelEm: null,
    createdAt: "2026-10-06T10:00:00.000Z",
    updatedAt: "2026-10-06T10:00:00.000Z",
  },
} satisfies ProdutoResponse;

afterEach(() => {
  cleanup();
  useProdutoMock.mockReset();
});

describe("EditarProduto", () => {
  it("exibe o estado de carregamento", () => {
    useProdutoMock.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isFetching: true,
      isPending: true,
      refetch: vi.fn(),
    });

    render(<EditarProduto produtoId={PRODUTO_ID} />);

    expect(
      screen.getByLabelText("Carregando formulário do produto"),
    ).toBeDefined();
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

    render(<EditarProduto produtoId={PRODUTO_ID} />);

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

    expect(screen.queryByTestId("formulario-edicao")).toBeNull();
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

    render(<EditarProduto produtoId={PRODUTO_ID} />);

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

  it("entrega o produto carregado ao formulário", () => {
    useProdutoMock.mockReturnValue({
      data: RESPOSTA,
      error: null,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    });

    render(<EditarProduto produtoId={PRODUTO_ID} />);

    expect(screen.getByTestId("formulario-edicao").textContent).toBe(
      "Notebook profissional",
    );
  });

  it("informa quando os dados estão sendo atualizados em segundo plano", () => {
    useProdutoMock.mockReturnValue({
      data: RESPOSTA,
      error: null,
      isError: false,
      isFetching: true,
      isPending: false,
      refetch: vi.fn(),
    });

    render(<EditarProduto produtoId={PRODUTO_ID} />);

    expect(screen.getByRole("status").textContent).toContain(
      "Atualizando dados do produto",
    );

    expect(screen.getByTestId("formulario-edicao")).toBeDefined();
  });
});
