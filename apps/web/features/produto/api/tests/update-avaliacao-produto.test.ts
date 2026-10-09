import {
  AvaliacaoProdutoResponseSchema,
  type AvaliacaoProdutoResponse,
} from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { updateAvaliacaoProduto } from "../update-avaliacao-produto";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

const RESPOSTA = {
  status: 200,
  sucesso: true,
  mensagem: "Avaliação atualizada com sucesso.",
  dados: {
    id: AVALIACAO_ID,
    produtoId: PRODUTO_ID,
    autorNome: "Maria atualizada",
    nota: 4,
    comentario: null,
    recomenda: false,
    createdAt: "2026-10-08T10:00:00.000Z",
    updatedAt: "2026-10-09T14:00:00.000Z",
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

describe("updateAvaliacaoProduto", () => {
  it("valida e normaliza os dados antes de chamar a API", async () => {
    const client = new ApiClientFake(RESPOSTA);
    const controller = new AbortController();

    const resultado = await updateAvaliacaoProduto(client, {
      produtoId: PRODUTO_ID,
      avaliacaoId: AVALIACAO_ID,
      body: {
        autorNome: " Maria atualizada ",
        nota: 4,
        comentario: null,
        recomenda: false,
      },
      signal: controller.signal,
    });

    expect(resultado).toBe(RESPOSTA);

    expect(client.requests[0]).toMatchObject({
      path: `/produtos/${PRODUTO_ID}/avaliacoes/${AVALIACAO_ID}`,
      method: "PATCH",
      body: {
        autorNome: "Maria atualizada",
        nota: 4,
        comentario: null,
        recomenda: false,
      },
      signal: controller.signal,
    });

    expect(client.requests[0]?.responseSchema).toBe(
      AvaliacaoProdutoResponseSchema,
    );
  });

  it("não chama a API quando produtoId é inválido", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      updateAvaliacaoProduto(client, {
        produtoId: "produto-invalido",
        avaliacaoId: AVALIACAO_ID,
        body: {
          nota: 4,
        },
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
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      updateAvaliacaoProduto(client, {
        produtoId: PRODUTO_ID,
        avaliacaoId: "avaliacao-invalida",
        body: {
          nota: 4,
        },
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

  it("não chama a API quando nenhum campo é informado", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      updateAvaliacaoProduto(client, {
        produtoId: PRODUTO_ID,
        avaliacaoId: AVALIACAO_ID,
        body: {},
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "DADOS_AVALIACAO_PRODUTO_INVALIDOS",
      categoria: "validacao",
    });

    expect(client.requests).toHaveLength(0);
  });

  it("não chama a API quando algum campo é inválido", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      updateAvaliacaoProduto(client, {
        produtoId: PRODUTO_ID,
        avaliacaoId: AVALIACAO_ID,
        body: {
          nota: 6,
        },
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "DADOS_AVALIACAO_PRODUTO_INVALIDOS",
      categoria: "validacao",
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "nota",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });
});
