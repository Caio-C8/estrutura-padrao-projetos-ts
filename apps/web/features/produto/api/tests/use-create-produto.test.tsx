// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusProduto, type ProdutoResponse } from "@repo/contracts";
import { produtoQueryKeys } from "../produto-query-keys";
import { useCreateProduto } from "../use-create-produto";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

const RESPOSTA = {
  status: 201,
  sucesso: true,
  mensagem: "Produto criado com sucesso.",
  dados: {
    id: PRODUTO_ID,
    sku: "PRODUTO-001",
    nome: "Notebook profissional",
    descricao: null,
    urlManual: null,
    status: StatusProduto.RASCUNHO,
    emDestaque: true,
    estoque: 0,
    preco: "370.98",
    pesoKg: null,
    quantidadeVendas: "0",
    dataValidade: null,
    disponivelEm: null,
    createdAt: "2026-10-06T10:00:00.000Z",
    updatedAt: "2026-10-06T10:00:00.000Z",
  },
} satisfies ProdutoResponse;

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

describe("useCreateProduto", () => {
  it("cria o produto e atualiza apenas os caches relacionados", async () => {
    requestMock.mockResolvedValue(RESPOSTA);

    const queryClient = criarQueryClient();
    const chaveLista = produtoQueryKeys.lista();

    queryClient.setQueryData(chaveLista, {
      dados: [],
    });

    const { result } = renderHook(() => useCreateProduto(), {
      wrapper: criarWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        sku: " produto-001 ",
        nome: " Notebook profissional ",
        preco: "370.98",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/produtos",
        method: "POST",
        body: {
          sku: "PRODUTO-001",
          nome: "Notebook profissional",
          status: StatusProduto.RASCUNHO,
          emDestaque: true,
          estoque: 0,
          preco: "370.98",
        },
      }),
    );

    expect(
      queryClient.getQueryData(produtoQueryKeys.detalhe(PRODUTO_ID)),
    ).toEqual(RESPOSTA);

    expect(queryClient.getQueryState(chaveLista)?.isInvalidated).toBe(true);

    queryClient.clear();
  });
});
