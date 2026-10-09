// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ListAvaliacoesProdutoResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { AvaliacoesProdutoListagem } from "../avaliacoes-produto-listagem";

const useAvaliacoesProdutoMock = vi.hoisted(() => vi.fn());
const refetchMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/produto/api/use-avaliacoes-produto", () => ({
  useAvaliacoesProduto: useAvaliacoesProdutoMock,
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

const QUERY = {
  pagina: "1",
  limite: "10",
  pesquisa: "maria",
  recomenda: "true",
};

const RESPOSTA = {
  status: 200,
  sucesso: true,
  mensagem: "Avaliações listadas com sucesso.",
  dados: [
    {
      id: AVALIACAO_ID,
      produtoId: PRODUTO_ID,
      autorNome: "Maria",
      nota: 5,
      createdAt: "2026-10-08T10:00:00.000Z",
    },
  ],
  meta: {
    total: 21,
    pagina: 1,
    ultimaPagina: 3,
    limite: 10,
  },
} satisfies ListAvaliacoesProdutoResponse;

beforeEach(() => {
  useAvaliacoesProdutoMock.mockReturnValue({
    isPending: false,
    isError: false,
    data: RESPOSTA,
    error: null,
    refetch: refetchMock,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AvaliacoesProdutoListagem", () => {
  it("apresenta o estado de carregamento", () => {
    useAvaliacoesProdutoMock.mockReturnValue({
      isPending: true,
      isError: false,
      data: undefined,
      error: null,
      refetch: refetchMock,
    });

    render(<AvaliacoesProdutoListagem produtoId={PRODUTO_ID} query={QUERY} />);

    expect(screen.getByLabelText("Carregando avaliações")).toBeDefined();
  });

  it("apresenta as avaliações retornadas", () => {
    render(<AvaliacoesProdutoListagem produtoId={PRODUTO_ID} query={QUERY} />);

    expect(screen.getByText("Maria")).toBeDefined();
    expect(screen.getByLabelText("Nota 5 de 5")).toBeDefined();
    expect(screen.getByText("21 avaliações")).toBeDefined();

    expect(
      screen.getByRole("navigation", {
        name: "Paginação das avaliações",
      }),
    ).toBeDefined();
  });

  it("apresenta o estado vazio", () => {
    useAvaliacoesProdutoMock.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        ...RESPOSTA,
        dados: [],
        meta: {
          total: 0,
          pagina: 1,
          ultimaPagina: 1,
          limite: 10,
        },
      },
      error: null,
      refetch: refetchMock,
    });

    render(<AvaliacoesProdutoListagem produtoId={PRODUTO_ID} query={QUERY} />);

    expect(screen.getByText("Nenhuma avaliação encontrada")).toBeDefined();
  });

  it("permite tentar novamente depois de uma falha", () => {
    useAvaliacoesProdutoMock.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      error: new ApiError({
        status: 500,
        codigo: "ERRO_INTERNO",
        mensagem: "Não foi possível consultar as avaliações.",
        categoria: "http",
        requisicaoId: "requisicao-123",
      }),
      refetch: refetchMock,
    });

    render(<AvaliacoesProdutoListagem produtoId={PRODUTO_ID} query={QUERY} />);

    expect(
      screen.getByText("Não foi possível consultar as avaliações."),
    ).toBeDefined();

    expect(screen.getByText("Referência: requisicao-123")).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tentar novamente",
      }),
    );

    expect(refetchMock).toHaveBeenCalledOnce();
  });

  it("diferencia produto inexistente de uma falha recuperável", () => {
    useAvaliacoesProdutoMock.mockReturnValue({
      isPending: false,
      isError: true,
      data: undefined,
      error: new ApiError({
        status: 404,
        codigo: "PRODUTO_NAO_ENCONTRADO",
        mensagem: "O produto informado não foi encontrado.",
        categoria: "http",
      }),
      refetch: refetchMock,
    });

    render(<AvaliacoesProdutoListagem produtoId={PRODUTO_ID} query={QUERY} />);

    expect(screen.getByText("Produto não encontrado")).toBeDefined();

    expect(
      screen
        .getByRole("link", {
          name: "Voltar para os produtos",
        })
        .getAttribute("href"),
    ).toBe("/produtos");

    expect(refetchMock).not.toHaveBeenCalled();
  });

  it("preserva os filtros nos links de paginação", () => {
    render(<AvaliacoesProdutoListagem produtoId={PRODUTO_ID} query={QUERY} />);

    expect(
      screen
        .getByRole("link", {
          name: "Próxima página",
        })
        .getAttribute("href"),
    ).toBe(
      `/produtos/${PRODUTO_ID}/avaliacoes?pagina=2&limite=10&pesquisa=maria&recomenda=true`,
    );

    expect(
      screen
        .getByRole("button", {
          name: "Página anterior",
        })
        .hasAttribute("disabled"),
    ).toBe(true);

    expect(
      screen
        .getByRole("link", {
          name: "Ver detalhes da avaliação de Maria",
        })
        .getAttribute("href"),
    ).toBe(`/produtos/${PRODUTO_ID}/avaliacoes/${AVALIACAO_ID}`);
  });
});
