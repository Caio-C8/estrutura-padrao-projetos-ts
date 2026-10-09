// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ListAvaliacoesProdutoResponse } from "@repo/contracts";
import { avaliacaoProdutoQueryKeys } from "../avaliacao-produto-query-keys";
import { useAvaliacoesProduto } from "../use-avaliacoes-produto";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
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
    total: 1,
    pagina: 1,
    ultimaPagina: 1,
    limite: 10,
  },
} satisfies ListAvaliacoesProdutoResponse;

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

describe("useAvaliacoesProduto", () => {
  it("executa a operação e armazena a resposta na chave do produto", async () => {
    requestMock.mockResolvedValue(RESPOSTA);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    const { result } = renderHook(
      () => useAvaliacoesProduto(PRODUTO_ID, QUERY),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/produtos/${PRODUTO_ID}/avaliacoes`,
        method: "GET",
        query: {
          pagina: 1,
          limite: 10,
          pesquisa: "maria",
          recomenda: true,
        },
        signal: expect.any(AbortSignal),
      }),
    );

    expect(
      queryClient.getQueryData(
        avaliacaoProdutoQueryKeys.lista(PRODUTO_ID, QUERY),
      ),
    ).toEqual(RESPOSTA);

    queryClient.clear();
  });
});
