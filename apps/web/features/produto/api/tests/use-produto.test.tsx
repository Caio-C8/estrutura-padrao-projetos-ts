// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusProduto, type ProdutoResponse } from "@repo/contracts";
import { produtoQueryKeys } from "../produto-query-keys";
import { useProduto } from "../use-produto";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
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
    descricao: "Notebook destinado ao uso profissional.",
    urlManual: "https://example.com/manual",
    status: StatusProduto.ATIVO,
    emDestaque: true,
    estoque: 10,
    preco: "370.98",
    pesoKg: 1.5,
    quantidadeVendas: "5",
    dataValidade: null,
    disponivelEm: "2026-12-02T10:00:00.000Z",
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
} satisfies ProdutoResponse;

function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
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

describe("useProduto", () => {
  it("executa a operação e armazena a resposta na chave correta", async () => {
    requestMock.mockResolvedValue(RESPOSTA);

    const queryClient = criarQueryClient();

    const { result } = renderHook(() => useProduto(PRODUTO_ID), {
      wrapper: criarWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/produtos/${PRODUTO_ID}`,
        method: "GET",
        signal: expect.any(AbortSignal),
      }),
    );

    expect(
      queryClient.getQueryData(produtoQueryKeys.detalhe(PRODUTO_ID)),
    ).toEqual(RESPOSTA);

    queryClient.clear();
  });

  it("não executa a operação quando o identificador é inválido", () => {
    const queryClient = criarQueryClient();

    const { result } = renderHook(() => useProduto("produto-invalido"), {
      wrapper: criarWrapper(queryClient),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(requestMock).not.toHaveBeenCalled();

    queryClient.clear();
  });
});
