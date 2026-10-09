import {
  AvaliacaoProdutoResponseSchema,
  type AvaliacaoProdutoResponse,
} from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { getAvaliacaoProduto } from "../get-avaliacao-produto";

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
    updatedAt: "2026-10-08T10:00:00.000Z",
  },
} satisfies AvaliacaoProdutoResponse;

class ApiClientFake implements ApiClient {
  readonly requests: ApiRequestOptions<unknown>[] = [];

  constructor(private readonly response: unknown) {}

  async request<TResponse = void>(
    options: ApiRequestOptions<TResponse>,
  ): Promise<TResponse> {
    this.requests.push(options as ApiRequestOptions<unknown>);

    return this.response as TResponse;
  }
}

describe("getAvaliacaoProduto", () => {
  it("consulta a avaliação dentro do produto", async () => {
    const client = new ApiClientFake(RESPOSTA);
    const controller = new AbortController();

    const resultado = await getAvaliacaoProduto(client, {
      produtoId: PRODUTO_ID,
      avaliacaoId: AVALIACAO_ID,
      signal: controller.signal,
    });

    expect(resultado).toBe(RESPOSTA);

    expect(client.requests[0]).toMatchObject({
      path: `/produtos/${PRODUTO_ID}/avaliacoes/${AVALIACAO_ID}`,
      method: "GET",
      signal: controller.signal,
    });

    expect(client.requests[0]?.responseSchema).toBe(
      AvaliacaoProdutoResponseSchema,
    );
  });

  it("não chama a API quando produtoId é inválido", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      getAvaliacaoProduto(client, {
        produtoId: "produto-invalido",
        avaliacaoId: AVALIACAO_ID,
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      codigo: "PARAMETROS_AVALIACAO_PRODUTO_INVALIDOS",
      categoria: "validacao",
      status: null,
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
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      getAvaliacaoProduto(client, {
        produtoId: PRODUTO_ID,
        avaliacaoId: "avaliacao-invalida",
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      codigo: "PARAMETROS_AVALIACAO_PRODUTO_INVALIDOS",
      categoria: "validacao",
      status: null,
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
