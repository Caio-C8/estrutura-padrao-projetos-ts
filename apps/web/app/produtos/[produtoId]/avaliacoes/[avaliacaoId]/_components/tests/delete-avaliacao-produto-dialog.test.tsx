// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import { avaliacaoProdutoQueryKeys } from "@/features/produto/api/avaliacao-produto-query-keys";
import { DeleteAvaliacaoProdutoDialog } from "../delete-avaliacao-produto-dialog";

const replaceMock = vi.hoisted(() => vi.fn());
const useDeleteAvaliacaoProdutoMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/features/produto/api/use-delete-avaliacao-produto", () => ({
  useDeleteAvaliacaoProduto: useDeleteAvaliacaoProdutoMock,
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";
const OUTRA_AVALIACAO_ID = "875035dc-7f98-4096-b062-11b72d07c427";

function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function criarWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function configurarMutation(
  valores: Partial<{
    mutateAsync: () => Promise<void>;
    reset: () => void;
    isPending: boolean;
    isError: boolean;
    error: ApiError | null;
  }> = {},
) {
  useDeleteAvaliacaoProdutoMock.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    ...valores,
  });
}

afterEach(() => {
  cleanup();
  replaceMock.mockReset();
  useDeleteAvaliacaoProdutoMock.mockReset();
  toastSuccessMock.mockReset();
});

describe("DeleteAvaliacaoProdutoDialog", () => {
  it("explica as consequências antes de excluir", () => {
    configurarMutation();

    const queryClient = criarQueryClient();

    render(
      <DeleteAvaliacaoProdutoDialog
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
        autorNome="Maria"
      />,
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Excluir avaliação",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Excluir esta avaliação?",
      }),
    ).toBeDefined();

    expect(
      screen.getByText(/ela será removida permanentemente/i),
    ).toBeDefined();

    queryClient.clear();
  });

  it("exclui, navega para a lista e remove somente o detalhe correto", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    configurarMutation({
      mutateAsync,
    });

    const queryClient = criarQueryClient();

    const chaveDetalhe = avaliacaoProdutoQueryKeys.detalhe(
      PRODUTO_ID,
      AVALIACAO_ID,
    );

    const chaveOutroDetalhe = avaliacaoProdutoQueryKeys.detalhe(
      PRODUTO_ID,
      OUTRA_AVALIACAO_ID,
    );

    queryClient.setQueryData(chaveDetalhe, {
      dados: {
        id: AVALIACAO_ID,
      },
    });

    queryClient.setQueryData(chaveOutroDetalhe, {
      dados: {
        id: OUTRA_AVALIACAO_ID,
      },
    });

    render(
      <DeleteAvaliacaoProdutoDialog
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
        autorNome="Maria"
      />,
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Excluir avaliação",
      }),
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", {
          name: "Excluir definitivamente",
        }),
      );
    });

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledOnce();
    });

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Avaliação excluída com sucesso.",
      {
        description: "A avaliação de “Maria” foi removida.",
      },
    );

    expect(replaceMock).toHaveBeenCalledWith(
      `/produtos/${PRODUTO_ID}/avaliacoes`,
    );

    expect(queryClient.getQueryData(chaveDetalhe)).toBeUndefined();

    expect(queryClient.getQueryData(chaveOutroDetalhe)).toEqual({
      dados: {
        id: OUTRA_AVALIACAO_ID,
      },
    });

    queryClient.clear();
  });

  it("mantém o diálogo aberto e apresenta o erro da API", () => {
    configurarMutation({
      isError: true,
      error: new ApiError({
        status: 404,
        codigo: "AVALIACAO_PRODUTO_NAO_ENCONTRADA",
        mensagem: "A avaliação informada não foi encontrada.",
        categoria: "http",
        requisicaoId: "requisicao-123",
      }),
    });

    const queryClient = criarQueryClient();

    render(
      <DeleteAvaliacaoProdutoDialog
        produtoId={PRODUTO_ID}
        avaliacaoId={AVALIACAO_ID}
        autorNome="Maria"
      />,
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Excluir avaliação",
      }),
    );

    expect(
      screen.getByText("Não foi possível excluir a avaliação"),
    ).toBeDefined();

    expect(
      screen.getByText("A avaliação informada não foi encontrada."),
    ).toBeDefined();

    expect(screen.getByText("Referência: requisicao-123")).toBeDefined();
    expect(screen.getByRole("alertdialog")).toBeDefined();

    queryClient.clear();
  });
});
