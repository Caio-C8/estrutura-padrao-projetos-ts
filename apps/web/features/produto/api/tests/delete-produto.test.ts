import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { deleteProduto } from "../delete-produto";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

class ApiClientFake implements ApiClient {
  readonly requests: ApiRequestOptions<unknown>[] = [];

  async request<TResponse = void>(
    options: ApiRequestOptions<TResponse>,
  ): Promise<TResponse> {
    this.requests.push(options as ApiRequestOptions<unknown>);

    return undefined as TResponse;
  }
}

describe("deleteProduto", () => {
  it("exclui o produto sem esperar corpo na resposta", async () => {
    const client = new ApiClientFake();
    const signal = new AbortController().signal;

    await expect(
      deleteProduto(client, {
        produtoId: PRODUTO_ID,
        signal,
      }),
    ).resolves.toBeUndefined();

    expect(client.requests).toHaveLength(1);

    expect(client.requests[0]).toEqual({
      path: `/produtos/${PRODUTO_ID}`,
      method: "DELETE",
      signal,
    });

    expect(client.requests[0]).not.toHaveProperty("responseSchema");
  });

  it("não chama a API quando o identificador é inválido", async () => {
    const client = new ApiClientFake();

    await expect(
      deleteProduto(client, {
        produtoId: "identificador-invalido",
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "PRODUTO_ID_INVALIDO",
      categoria: "validacao",
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "id",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });
});
