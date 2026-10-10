import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { deleteAvaliacaoProduto } from "../delete-avaliacao-produto";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

class ApiClientFake implements ApiClient {
  readonly requests: ApiRequestOptions<unknown>[] = [];

  async request<TResponse = void>(
    options: ApiRequestOptions<TResponse>,
  ): Promise<TResponse> {
    this.requests.push(options as ApiRequestOptions<unknown>);

    return undefined as TResponse;
  }
}

describe("deleteAvaliacaoProduto", () => {
  it("exclui a avaliação sem esperar corpo na resposta", async () => {
    const client = new ApiClientFake();
    const signal = new AbortController().signal;

    await expect(
      deleteAvaliacaoProduto(client, {
        produtoId: PRODUTO_ID,
        avaliacaoId: AVALIACAO_ID,
        signal,
      }),
    ).resolves.toBeUndefined();

    expect(client.requests).toHaveLength(1);

    expect(client.requests[0]).toEqual({
      path: `/produtos/${PRODUTO_ID}/avaliacoes/${AVALIACAO_ID}`,
      method: "DELETE",
      signal,
    });

    expect(client.requests[0]).not.toHaveProperty("responseSchema");
  });

  it("não chama a API quando produtoId é inválido", async () => {
    const client = new ApiClientFake();

    await expect(
      deleteAvaliacaoProduto(client, {
        produtoId: "produto-invalido",
        avaliacaoId: AVALIACAO_ID,
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "PARAMETROS_AVALIACAO_PRODUTO_INVALIDOS",
      categoria: "validacao",
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "produtoId",
          codigo: "IDENTIFICADOR_INVALIDO",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });

  it("não chama a API quando avaliacaoId é inválido", async () => {
    const client = new ApiClientFake();

    await expect(
      deleteAvaliacaoProduto(client, {
        produtoId: PRODUTO_ID,
        avaliacaoId: "avaliacao-invalida",
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "PARAMETROS_AVALIACAO_PRODUTO_INVALIDOS",
      categoria: "validacao",
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "avaliacaoId",
          codigo: "IDENTIFICADOR_INVALIDO",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });
});
