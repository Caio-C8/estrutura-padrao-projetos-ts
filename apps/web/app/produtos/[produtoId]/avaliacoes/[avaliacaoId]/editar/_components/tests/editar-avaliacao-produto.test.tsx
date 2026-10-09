// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AvaliacaoProdutoResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { EditarAvaliacaoProduto } from "../editar-avaliacao-produto";

const useAvaliacaoProdutoMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/produto/api/use-avaliacao-produto", () => ({
  useAvaliacaoProduto: useAvaliacaoProdutoMock,
}));

vi.mock("../update-avaliacao-produto-form", () => ({
  UpdateAvaliacaoProdutoForm: ({
    avaliacao,
  }: {
    avaliacao: {
      autorNome: string;
    };
  }) => <div data-testid="formulario-edicao">{avaliacao.autorNome}</div>,
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

const RESPOSTA = {
  status: 200,
  sucesso: true,
  mensagem: "Avaliação encontrada com sucesso.",
  dados: {
    id: AVALIACAO_ID,
    produtoId: PRODUTO_ID,
    autorNome: "Maria",
    nota: 5,
    comentario: "Produto excelente.",
    recomenda: true,
    createdAt: "2026-10-08T10:00:00.000Z",
    updatedAt: "2026-10-08T11:00:00.000Z",
  },
} satisfies AvaliacaoProdutoResponse;

afterEach(() => {
  cleanup();
  useAvaliacaoProdutoMock.mockReset();
});

describe("EditarAvaliacaoProduto", () => {
  it("exibe o estado de carregamento", () => {
    useAvaliacaoProdutoMock.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isFetching: true,
      isPending: true,
      refetch: vi.fn(),
    });

    render(
      <EditarAvaliacaoProduto
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(
      screen.getByLabelText("Carregando formulário da avaliação"),
    ).toBeDefined();
  });

  it("trata avaliação inexistente separadamente", () => {
    useAvaliacaoProdutoMock.mockReturnValue({
      data: undefined,
      error: new ApiError({
        status: 404,
        codigo: "AVALIACAO_PRODUTO_NAO_ENCONTRADA",
        mensagem: "Avaliação não encontrada.",
        categoria: "http",
      }),
      isError: true,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    });

    render(
      <EditarAvaliacaoProduto
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Avaliação não encontrada",
      }),
    ).toBeDefined();

    expect(
      screen
        .getByRole("link", {
          name: "Voltar para avaliações",
        })
        .getAttribute("href"),
    ).toBe(`/produtos/${PRODUTO_ID}/avaliacoes`);

    expect(screen.queryByTestId("formulario-edicao")).toBeNull();
  });

  it("trata produto inexistente separadamente", () => {
    useAvaliacaoProdutoMock.mockReturnValue({
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

    render(
      <EditarAvaliacaoProduto
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Produto não encontrado",
      }),
    ).toBeDefined();

    expect(
      screen
        .getByRole("link", {
          name: "Voltar para produtos",
        })
        .getAttribute("href"),
    ).toBe("/produtos");
  });

  it("exibe erro recuperável e permite tentar novamente", () => {
    const refetch = vi.fn();

    useAvaliacaoProdutoMock.mockReturnValue({
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

    render(
      <EditarAvaliacaoProduto
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(
      screen.getByText("Não foi possível carregar a avaliação"),
    ).toBeDefined();

    expect(screen.getByText("Referência: requisicao-123")).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tentar novamente",
      }),
    );

    expect(refetch).toHaveBeenCalledOnce();
  });

  it("entrega a avaliação carregada ao formulário", () => {
    useAvaliacaoProdutoMock.mockReturnValue({
      data: RESPOSTA,
      error: null,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    });

    render(
      <EditarAvaliacaoProduto
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(screen.getByTestId("formulario-edicao").textContent).toBe("Maria");

    expect(useAvaliacaoProdutoMock).toHaveBeenCalledWith(
      PRODUTO_ID,
      AVALIACAO_ID,
    );
  });

  it("informa a atualização em segundo plano sem remover o formulário", () => {
    useAvaliacaoProdutoMock.mockReturnValue({
      data: RESPOSTA,
      error: null,
      isError: false,
      isFetching: true,
      isPending: false,
      refetch: vi.fn(),
    });

    render(
      <EditarAvaliacaoProduto
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(screen.getByRole("status").textContent).toContain(
      "Atualizando dados da avaliação",
    );

    expect(screen.getByTestId("formulario-edicao")).toBeDefined();
  });
});
