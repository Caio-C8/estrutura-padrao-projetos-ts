// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AvaliacaoProdutoResponse } from "@repo/contracts";
import { avaliacaoProdutoQueryKeys } from "../avaliacao-produto-query-keys";
import { useCreateAvaliacaoProduto } from "../use-create-avaliacao-produto";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

const RESPOSTA = {
  status: 201,
  sucesso: true,
  mensagem: "Avaliação criada com sucesso.",
  dados: {
    id: AVALIACAO_ID,
    produtoId: PRODUTO_ID,
    autorNome: "Maria",
    nota: 5,
    comentario: "Produto excelente.",
    recomenda: true,
    createdAt: "2026-10-08T10:00:00.000Z",
    updatedAt: "2026-10-08T10:00:00.000Z",
  },
} satisfies AvaliacaoProdutoResponse;

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

describe("useCreateAvaliacaoProduto", () => {
  it("cria a avaliação e atualiza os caches relacionados", async () => {
    requestMock.mockResolvedValue(RESPOSTA);

    const queryClient = criarQueryClient();

    const chaveLista = avaliacaoProdutoQueryKeys.lista(PRODUTO_ID, {
      pagina: "1",
      limite: "10",
    });

    queryClient.setQueryData(chaveLista, {
      dados: [],
    });

    const { result } = renderHook(() => useCreateAvaliacaoProduto(PRODUTO_ID), {
      wrapper: criarWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        autorNome: " Maria ",
        nota: 5,
        comentario: " Produto excelente. ",
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/produtos/${PRODUTO_ID}/avaliacoes`,
        method: "POST",
        body: {
          autorNome: "Maria",
          nota: 5,
          comentario: "Produto excelente.",
          recomenda: true,
        },
      }),
    );

    expect(
      queryClient.getQueryData(
        avaliacaoProdutoQueryKeys.detalhe(PRODUTO_ID, AVALIACAO_ID),
      ),
    ).toEqual(RESPOSTA);

    expect(queryClient.getQueryState(chaveLista)?.isInvalidated).toBe(true);

    queryClient.clear();
  });
});
