// @vitest-environment jsdom

import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StatusProduto, type ProdutoResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { produtoQueryKeys } from "../produto-query-keys";
import { useUpdateProduto } from "../use-update-produto";

const requestMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api/browser-api-client", () => ({
  browserApiClient: {
    request: requestMock,
  },
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

const RESPOSTA_ANTERIOR = {
  status: 200,
  sucesso: true,
  mensagem: "Produto encontrado com sucesso.",
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

const RESPOSTA_ATUALIZADA = {
  status: 200,
  sucesso: true,
  mensagem: "Produto atualizado com sucesso.",
  dados: {
    ...RESPOSTA_ANTERIOR.dados,
    nome: "Notebook atualizado",
    status: StatusProduto.ATIVO,
    updatedAt: "2026-10-06T14:00:00.000Z",
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

describe("useUpdateProduto", () => {
  it("atualiza o cache do detalhe e invalida as listas", async () => {
    requestMock.mockResolvedValue(RESPOSTA_ATUALIZADA);

    const queryClient = criarQueryClient();
    const chaveDetalhe = produtoQueryKeys.detalhe(PRODUTO_ID);
    const chaveLista = produtoQueryKeys.lista();

    queryClient.setQueryData(chaveDetalhe, RESPOSTA_ANTERIOR);
    queryClient.setQueryData(chaveLista, {
      dados: [],
    });

    const { result } = renderHook(() => useUpdateProduto(PRODUTO_ID), {
      wrapper: criarWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        nome: " Notebook atualizado ",
        status: StatusProduto.ATIVO,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(requestMock).toHaveBeenCalledOnce();

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `/produtos/${PRODUTO_ID}`,
        method: "PATCH",
        body: {
          nome: "Notebook atualizado",
          status: StatusProduto.ATIVO,
        },
      }),
    );

    expect(queryClient.getQueryData(chaveDetalhe)).toEqual(RESPOSTA_ATUALIZADA);

    expect(queryClient.getQueryState(chaveLista)?.isInvalidated).toBe(true);

    queryClient.clear();
  });

  it("preserva o cache quando a atualização falha", async () => {
    const erro = new ApiError({
      status: 409,
      codigo: "SKU_PRODUTO_JA_EXISTENTE",
      mensagem: "Já existe um produto com o SKU informado.",
      categoria: "http",
      erros: [
        {
          campo: "sku",
          codigo: "VALOR_JA_EXISTENTE",
          mensagem: "Já existe um produto com este SKU.",
        },
      ],
    });

    requestMock.mockRejectedValue(erro);

    const queryClient = criarQueryClient();
    const chaveDetalhe = produtoQueryKeys.detalhe(PRODUTO_ID);
    const chaveLista = produtoQueryKeys.lista();

    queryClient.setQueryData(chaveDetalhe, RESPOSTA_ANTERIOR);
    queryClient.setQueryData(chaveLista, {
      dados: [],
    });

    const { result } = renderHook(() => useUpdateProduto(PRODUTO_ID), {
      wrapper: criarWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          sku: "PRODUTO-001",
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
