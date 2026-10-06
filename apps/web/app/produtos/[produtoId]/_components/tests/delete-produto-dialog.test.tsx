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
import { produtoQueryKeys } from "@/features/produto/api/produto-query-keys";
import { DeleteProdutoDialog } from "../delete-produto-dialog";

const replaceMock = vi.hoisted(() => vi.fn());
const useDeleteProdutoMock = vi.hoisted(() => vi.fn());
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

vi.mock("@/features/produto/api/use-delete-produto", () => ({
  useDeleteProduto: useDeleteProdutoMock,
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

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
  useDeleteProdutoMock.mockReturnValue({
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
  useDeleteProdutoMock.mockReset();
  toastSuccessMock.mockReset();
});

describe("DeleteProdutoDialog", () => {
  it("explica as consequências antes de excluir", () => {
    configurarMutation();

    const queryClient = criarQueryClient();

    render(
      <DeleteProdutoDialog
        produtoId={PRODUTO_ID}
        produtoNome="Notebook profissional"
      />,
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Excluir produto",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Excluir este produto?",
      }),
    ).toBeDefined();

    expect(
      screen.getByText(/suas avaliações também serão excluídas/i),
    ).toBeDefined();

    queryClient.clear();
  });

  it("exclui, navega para a listagem e remove o detalhe do cache", async () => {
    const mutateAsync = vi.fn().mockResolvedValue(undefined);

    configurarMutation({
      mutateAsync,
    });

    const queryClient = criarQueryClient();
    const chaveDetalhe = produtoQueryKeys.detalhe(PRODUTO_ID);

    queryClient.setQueryData(chaveDetalhe, {
      dados: {
        id: PRODUTO_ID,
      },
    });

    render(
      <DeleteProdutoDialog
        produtoId={PRODUTO_ID}
        produtoNome="Notebook profissional"
      />,
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Excluir produto",
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
      "Produto excluído com sucesso.",
      {
        description: "O produto e suas avaliações foram removidos.",
      },
    );

    expect(replaceMock).toHaveBeenCalledWith("/produtos");

    expect(queryClient.getQueryData(chaveDetalhe)).toBeUndefined();

    queryClient.clear();
  });

  it("mantém o diálogo aberto e apresenta o erro da API", () => {
    configurarMutation({
      isError: true,
      error: new ApiError({
        status: 409,
        codigo: "PRODUTO_NAO_PODE_SER_EXCLUIDO",
        mensagem: "O produto não pode ser excluído neste momento.",
        categoria: "http",
        requisicaoId: "requisicao-123",
      }),
    });

    const queryClient = criarQueryClient();

    render(
      <DeleteProdutoDialog
        produtoId={PRODUTO_ID}
        produtoNome="Notebook profissional"
      />,
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Excluir produto",
      }),
    );

    expect(
      screen.getByText("Não foi possível excluir o produto"),
    ).toBeDefined();

    expect(
      screen.getByText("O produto não pode ser excluído neste momento."),
    ).toBeDefined();

    expect(screen.getByText("Referência: requisicao-123")).toBeDefined();

    expect(screen.getByRole("alertdialog")).toBeDefined();

    queryClient.clear();
  });
});
