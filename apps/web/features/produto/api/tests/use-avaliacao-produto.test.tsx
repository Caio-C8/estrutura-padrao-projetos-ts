// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AvaliacaoProdutoResponse } from "@repo/contracts";
import { avaliacaoProdutoQueryKeys } from "../avaliacao-produto-query-keys";
import { useAvaliacaoProduto } from "../use-avaliacao-produto";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
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

describe("useAvaliacaoProduto", () => {
  it("consulta e armazena a avaliação na chave do produto", async () => {
    requestMock.mockResolvedValue(RESPOSTA);

    const queryClient = criarQueryClient();

    const { result } = renderHook(
      () => useAvaliacaoProduto(PRODUTO_ID, AVALIACAO_ID),
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
        path: `/produtos/${PRODUTO_ID}/avaliacoes/${AVALIACAO_ID}`,
        method: "GET",
        signal: expect.any(AbortSignal),
      }),
    );

    expect(
      queryClient.getQueryData(
        avaliacaoProdutoQueryKeys.detalhe(PRODUTO_ID, AVALIACAO_ID),
      ),
    ).toEqual(RESPOSTA);

    queryClient.clear();
  });

  it("não consulta a API quando os identificadores são inválidos", () => {
    const queryClient = criarQueryClient();

    const { result } = renderHook(
      () => useAvaliacaoProduto("produto-invalido", "avaliacao-invalida"),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(requestMock).not.toHaveBeenCalled();

    queryClient.clear();
  });
});
