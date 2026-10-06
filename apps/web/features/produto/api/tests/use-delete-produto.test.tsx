// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import { produtoQueryKeys } from "../produto-query-keys";
import { useDeleteProduto } from "../use-delete-produto";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
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

afterEach(() => {
  cleanup();
  requestMock.mockReset();
});

describe("useDeleteProduto", () => {
  it("exclui o produto e invalida as listas", async () => {
    requestMock.mockResolvedValue(undefined);

    const queryClient = criarQueryClient();
    const chaveLista = produtoQueryKeys.lista();

    queryClient.setQueryData(chaveLista, {
      dados: [],
    });

    const { result } = renderHook(() => useDeleteProduto(PRODUTO_ID), {
      wrapper: criarWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(requestMock).toHaveBeenCalledWith({
      path: `/produtos/${PRODUTO_ID}`,
      method: "DELETE",
      signal: undefined,
    });

    expect(queryClient.getQueryState(chaveLista)?.isInvalidated).toBe(true);

    queryClient.clear();
  });

  it("preserva o cache quando a exclusão falha", async () => {
    const erro = new ApiError({
      status: 404,
      codigo: "PRODUTO_NAO_ENCONTRADO",
      mensagem: "Produto não encontrado.",
      categoria: "http",
    });

    requestMock.mockRejectedValue(erro);

    const queryClient = criarQueryClient();
    const chaveLista = produtoQueryKeys.lista();

    queryClient.setQueryData(chaveLista, {
      dados: [],
    });

    const { result } = renderHook(() => useDeleteProduto(PRODUTO_ID), {
      wrapper: criarWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toBe(erro);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(queryClient.getQueryState(chaveLista)?.isInvalidated).toBe(false);

    queryClient.clear();
  });
});
