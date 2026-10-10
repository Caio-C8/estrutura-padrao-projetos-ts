// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import { avaliacaoProdutoQueryKeys } from "../avaliacao-produto-query-keys";
import { useDeleteAvaliacaoProduto } from "../use-delete-avaliacao-produto";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const OUTRO_PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

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

describe("useDeleteAvaliacaoProduto", () => {
  it("exclui e invalida somente as listas do produto", async () => {
    requestMock.mockResolvedValue(undefined);

    const queryClient = criarQueryClient();

    const chaveListaProduto = avaliacaoProdutoQueryKeys.lista(PRODUTO_ID, {
      pagina: "1",
      limite: "10",
    });

    const chaveListaOutroProduto = avaliacaoProdutoQueryKeys.lista(
      OUTRO_PRODUTO_ID,
      {
        pagina: "1",
        limite: "10",
      },
    );

    const chaveDetalhe = avaliacaoProdutoQueryKeys.detalhe(
      PRODUTO_ID,
      AVALIACAO_ID,
    );

    const detalheEmCache = {
      dados: {
        id: AVALIACAO_ID,
      },
    };

    queryClient.setQueryData(chaveListaProduto, { dados: [] });
    queryClient.setQueryData(chaveListaOutroProduto, { dados: [] });
    queryClient.setQueryData(chaveDetalhe, detalheEmCache);

    const { result } = renderHook(
      () => useDeleteAvaliacaoProduto(PRODUTO_ID, AVALIACAO_ID),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(requestMock).toHaveBeenCalledWith({
      path: `/produtos/${PRODUTO_ID}/avaliacoes/${AVALIACAO_ID}`,
      method: "DELETE",
      signal: undefined,
    });

    expect(queryClient.getQueryState(chaveListaProduto)?.isInvalidated).toBe(
      true,
    );

    expect(
      queryClient.getQueryState(chaveListaOutroProduto)?.isInvalidated,
    ).toBe(false);

    expect(queryClient.getQueryData(chaveDetalhe)).toEqual(detalheEmCache);

    queryClient.clear();
  });

  it("preserva os caches quando a exclusão falha", async () => {
    const erro = new ApiError({
      status: 404,
      codigo: "AVALIACAO_PRODUTO_NAO_ENCONTRADA",
      mensagem: "A avaliação informada não foi encontrada.",
      categoria: "http",
    });

    requestMock.mockRejectedValue(erro);

    const queryClient = criarQueryClient();

    const chaveLista = avaliacaoProdutoQueryKeys.lista(PRODUTO_ID, {
      pagina: "1",
      limite: "10",
    });

    const chaveDetalhe = avaliacaoProdutoQueryKeys.detalhe(
      PRODUTO_ID,
      AVALIACAO_ID,
    );

    const detalheEmCache = {
      dados: {
        id: AVALIACAO_ID,
      },
    };

    queryClient.setQueryData(chaveLista, { dados: [] });
    queryClient.setQueryData(chaveDetalhe, detalheEmCache);

    const { result } = renderHook(
      () => useDeleteAvaliacaoProduto(PRODUTO_ID, AVALIACAO_ID),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    await act(async () => {
      await expect(result.current.mutateAsync()).rejects.toBe(erro);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(queryClient.getQueryState(chaveLista)?.isInvalidated).toBe(false);
    expect(queryClient.getQueryData(chaveDetalhe)).toEqual(detalheEmCache);

    queryClient.clear();
  });
});
