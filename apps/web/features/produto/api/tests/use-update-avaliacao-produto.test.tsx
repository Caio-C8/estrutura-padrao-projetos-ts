// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AvaliacaoProdutoResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { avaliacaoProdutoQueryKeys } from "../avaliacao-produto-query-keys";
import { useUpdateAvaliacaoProduto } from "../use-update-avaliacao-produto";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const OUTRO_PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

const RESPOSTA_ANTERIOR = {
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
    updatedAt: "2026-10-08T10:00:00.000Z",
  },
} satisfies AvaliacaoProdutoResponse;

const RESPOSTA_ATUALIZADA = {
  status: 200,
  sucesso: true,
  mensagem: "Avaliação atualizada com sucesso.",
  dados: {
    ...RESPOSTA_ANTERIOR.dados,
    autorNome: "Maria atualizada",
    nota: 4,
    comentario: null,
    recomenda: false,
    updatedAt: "2026-10-09T14:00:00.000Z",
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

describe("useUpdateAvaliacaoProduto", () => {
  it("atualiza o detalhe e invalida somente as listas do produto", async () => {
    requestMock.mockResolvedValue(RESPOSTA_ATUALIZADA);

    const queryClient = criarQueryClient();

    const chaveDetalhe = avaliacaoProdutoQueryKeys.detalhe(
      PRODUTO_ID,
      AVALIACAO_ID,
    );

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

    queryClient.setQueryData(chaveDetalhe, RESPOSTA_ANTERIOR);
    queryClient.setQueryData(chaveListaProduto, { dados: [] });
    queryClient.setQueryData(chaveListaOutroProduto, { dados: [] });

    const { result } = renderHook(
      () => useUpdateAvaliacaoProduto(PRODUTO_ID, AVALIACAO_ID),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    await act(async () => {
      await result.current.mutateAsync({
        autorNome: " Maria atualizada ",
        nota: 4,
        comentario: null,
        recomenda: false,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/produtos/${PRODUTO_ID}/avaliacoes/${AVALIACAO_ID}`,
        method: "PATCH",
        body: {
          autorNome: "Maria atualizada",
          nota: 4,
          comentario: null,
          recomenda: false,
        },
      }),
    );

    expect(queryClient.getQueryData(chaveDetalhe)).toEqual(RESPOSTA_ATUALIZADA);

    expect(queryClient.getQueryState(chaveListaProduto)?.isInvalidated).toBe(
      true,
    );

    expect(
      queryClient.getQueryState(chaveListaOutroProduto)?.isInvalidated,
    ).toBe(false);

    queryClient.clear();
  });

  it("preserva os caches quando a atualização falha", async () => {
    const erro = new ApiError({
      status: 404,
      codigo: "AVALIACAO_PRODUTO_NAO_ENCONTRADA",
      mensagem: "A avaliação informada não foi encontrada.",
      categoria: "http",
      erros: [],
    });

    requestMock.mockRejectedValue(erro);

    const queryClient = criarQueryClient();

    const chaveDetalhe = avaliacaoProdutoQueryKeys.detalhe(
      PRODUTO_ID,
      AVALIACAO_ID,
    );

    const chaveLista = avaliacaoProdutoQueryKeys.lista(PRODUTO_ID, {
      pagina: "1",
      limite: "10",
    });

    queryClient.setQueryData(chaveDetalhe, RESPOSTA_ANTERIOR);
    queryClient.setQueryData(chaveLista, { dados: [] });

    const { result } = renderHook(
      () => useUpdateAvaliacaoProduto(PRODUTO_ID, AVALIACAO_ID),
      {
        wrapper: criarWrapper(queryClient),
      },
    );

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          nota: 4,
        }),
      ).rejects.toBe(erro);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(queryClient.getQueryData(chaveDetalhe)).toEqual(RESPOSTA_ANTERIOR);
    expect(queryClient.getQueryState(chaveLista)?.isInvalidated).toBe(false);

    queryClient.clear();
  });
});
