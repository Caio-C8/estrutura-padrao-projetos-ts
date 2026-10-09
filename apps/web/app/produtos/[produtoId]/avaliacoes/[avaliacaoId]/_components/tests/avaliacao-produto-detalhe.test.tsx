// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AvaliacaoProdutoResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { AvaliacaoProdutoDetalhe } from "../avaliacao-produto-detalhe";

const useAvaliacaoProdutoMock = vi.hoisted(() => vi.fn());
const refetchMock = vi.hoisted(() => vi.fn());

vi.mock("@/features/produto/api/use-avaliacao-produto", () => ({
  useAvaliacaoProduto: useAvaliacaoProdutoMock,
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

beforeEach(() => {
  useAvaliacaoProdutoMock.mockReturnValue({
    data: RESPOSTA,
    error: null,
    isError: false,
    isFetching: false,
    isPending: false,
    refetch: refetchMock,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AvaliacaoProdutoDetalhe", () => {
  it("exibe o estado de carregamento", () => {
    useAvaliacaoProdutoMock.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isFetching: true,
      isPending: true,
      refetch: refetchMock,
    });

    render(
      <AvaliacaoProdutoDetalhe
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(screen.getByLabelText("Carregando avaliação")).toBeDefined();
  });

  it("exibe todas as informações da avaliação", () => {
    render(
      <AvaliacaoProdutoDetalhe
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Maria",
      }),
    ).toBeDefined();

    expect(screen.getByLabelText("Nota 5 de 5")).toBeDefined();
    expect(screen.getByText("Produto excelente.")).toBeDefined();
    expect(screen.getByText("Sim")).toBeDefined();

    const datas = screen.getAllByRole("time");

    expect(datas).toHaveLength(2);
    expect(datas[0]?.getAttribute("datetime")).toBe(RESPOSTA.dados.createdAt);
    expect(datas[1]?.getAttribute("datetime")).toBe(RESPOSTA.dados.updatedAt);

    expect(useAvaliacaoProdutoMock).toHaveBeenCalledWith(
      PRODUTO_ID,
      AVALIACAO_ID,
    );
  });

  it("exibe comentário não informado quando seu valor é null", () => {
    useAvaliacaoProdutoMock.mockReturnValue({
      data: {
        ...RESPOSTA,
        dados: {
          ...RESPOSTA.dados,
          comentario: null,
        },
      },
      error: null,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: refetchMock,
    });

    render(
      <AvaliacaoProdutoDetalhe
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(screen.getByText("Não informado")).toBeDefined();
  });

  it("permite tentar novamente depois de uma falha recuperável", () => {
    useAvaliacaoProdutoMock.mockReturnValue({
      data: undefined,
      error: new ApiError({
        status: 500,
        codigo: "ERRO_INTERNO",
        mensagem: "Não foi possível consultar a avaliação.",
        categoria: "http",
        requisicaoId: "requisicao-123",
      }),
      isError: true,
      isFetching: false,
      isPending: false,
      refetch: refetchMock,
    });

    render(
      <AvaliacaoProdutoDetalhe
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
      />,
    );

    expect(
      screen.getByText("Não foi possível consultar a avaliação."),
    ).toBeDefined();

    expect(screen.getByText("Referência: requisicao-123")).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Tentar novamente",
      }),
    );

    expect(refetchMock).toHaveBeenCalledOnce();
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
      refetch: refetchMock,
    });

    render(
      <AvaliacaoProdutoDetalhe
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
      refetch: refetchMock,
    });

    render(
      <AvaliacaoProdutoDetalhe
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
});
