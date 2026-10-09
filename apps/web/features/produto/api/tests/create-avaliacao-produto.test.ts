import {
  AvaliacaoProdutoResponseSchema,
  type AvaliacaoProdutoResponse,
} from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { createAvaliacaoProduto } from "../create-avaliacao-produto";

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

describe("createAvaliacaoProduto", () => {
  it("valida e normaliza os dados antes de chamar a API", async () => {
    const client = new ApiClientFake(RESPOSTA);

    const resultado = await createAvaliacaoProduto(client, {
      produtoId: PRODUTO_ID,
      body: {
        autorNome: " Maria ",
        nota: 5,
        comentario: " Produto excelente. ",
      },
    });

    expect(resultado).toBe(RESPOSTA);

    expect(client.requests[0]).toMatchObject({
      path: `/produtos/${PRODUTO_ID}/avaliacoes`,
      method: "POST",
      body: {
        autorNome: "Maria",
        nota: 5,
        comentario: "Produto excelente.",
        recomenda: true,
      },
    });

    expect(client.requests[0]?.responseSchema).toBe(
      AvaliacaoProdutoResponseSchema,
    );
  });

  it("não chama a API quando o produtoId é inválido", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      createAvaliacaoProduto(client, {
        produtoId: "produto-invalido",
        body: {
          autorNome: "Maria",
          nota: 5,
          recomenda: true,
        },
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "PRODUTO_ID_INVALIDO",
      categoria: "validacao",
    });

    expect(client.requests).toHaveLength(0);
  });

  it("não chama a API quando o body é inválido", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      createAvaliacaoProduto(client, {
        produtoId: PRODUTO_ID,
        body: {
          autorNome: "",
          nota: 6,
          recomenda: true,
        },
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "DADOS_AVALIACAO_PRODUTO_INVALIDOS",
      categoria: "validacao",
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "autorNome",
        }),
        expect.objectContaining({
          campo: "nota",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });
});
