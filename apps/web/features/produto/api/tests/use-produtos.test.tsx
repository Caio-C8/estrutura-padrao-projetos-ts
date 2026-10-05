// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusProduto, type ListProdutosResponse } from "@repo/contracts";
import { produtoQueryKeys } from "../produto-query-keys";
import { useProdutos } from "../use-produtos";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
}));

const RESPOSTA = {
  status: 200,
  sucesso: true,
  mensagem: "Produtos listados com sucesso.",
  dados: [],
  meta: {
    total: 0,
    pagina: 2,
    ultimaPagina: 1,
    limite: 10,
  },
} satisfies ListProdutosResponse;

const QUERY = {
  pagina: "2",
  limite: "10",
  pesquisa: "notebook",
  status: StatusProduto.ATIVO,
  emDestaque: "false",
};

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

describe("useProdutos", () => {
  it("executa a operação e armazena a resposta na chave correta", async () => {
    requestMock.mockResolvedValue(RESPOSTA);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(() => useProdutos(QUERY), {
      wrapper: criarWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/produtos",
        method: "GET",
        query: {
          pagina: 2,
          limite: 10,
          pesquisa: "notebook",
          status: StatusProduto.ATIVO,
          emDestaque: false,
        },
        signal: expect.any(AbortSignal),
      }),
    );

    expect(queryClient.getQueryData(produtoQueryKeys.lista(QUERY))).toEqual(
      RESPOSTA,
    );

    queryClient.clear();
  });
});
