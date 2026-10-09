import {
  ListAvaliacoesProdutoResponseSchema,
  type ListAvaliacoesProdutoResponse,
} from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { getAvaliacoesProduto } from "../get-avaliacoes-produto";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

const RESPOSTA_VAZIA = {
  status: 200,
  sucesso: true,
  mensagem: "Avaliações listadas com sucesso.",
  dados: [],
  meta: {
    total: 0,
    pagina: 1,
    ultimaPagina: 1,
    limite: 20,
  },
} satisfies ListAvaliacoesProdutoResponse;

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

describe("getAvaliacoesProduto", () => {
  it("aplica os valores padrão da paginação", async () => {
    const client = new ApiClientFake(RESPOSTA_VAZIA);

    const resultado = await getAvaliacoesProduto(client, {
      produtoId: PRODUTO_ID,
    });

    expect(resultado).toBe(RESPOSTA_VAZIA);
    expect(client.requests).toHaveLength(1);

    expect(client.requests[0]).toMatchObject({
      path: `/produtos/${PRODUTO_ID}/avaliacoes`,
      method: "GET",
      query: {
        pagina: 1,
        limite: 20,
        pesquisa: undefined,
        recomenda: undefined,
      },
    });

    expect(client.requests[0]?.responseSchema).toBe(
      ListAvaliacoesProdutoResponseSchema,
    );
  });

  it("normaliza os filtros e encaminha o sinal de cancelamento", async () => {
    const client = new ApiClientFake(RESPOSTA_VAZIA);
    const controller = new AbortController();

    await getAvaliacoesProduto(client, {
      produtoId: PRODUTO_ID,
      query: {
        pagina: "2",
        limite: "10",
        pesquisa: "  maria  ",
        recomenda: "FALSE",
      },
      signal: controller.signal,
    });

    expect(client.requests[0]).toMatchObject({
      path: `/produtos/${PRODUTO_ID}/avaliacoes`,
      method: "GET",
      query: {
        pagina: 2,
        limite: 10,
        pesquisa: "maria",
        recomenda: false,
      },
      signal: controller.signal,
    });
  });

  it("não chama a API quando o produtoId é inválido", async () => {
    const client = new ApiClientFake(RESPOSTA_VAZIA);

    await expect(
      getAvaliacoesProduto(client, {
        produtoId: "produto-invalido",
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      codigo: "PRODUTO_ID_INVALIDO",
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

  it("não chama a API quando os filtros são inválidos", async () => {
    const client = new ApiClientFake(RESPOSTA_VAZIA);

    await expect(
      getAvaliacoesProduto(client, {
        produtoId: PRODUTO_ID,
        query: {
          pesquisa: "   ",
          recomenda: "sim",
        },
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      codigo: "FILTROS_AVALIACOES_PRODUTO_INVALIDOS",
      categoria: "validacao",
      status: null,
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "pesquisa",
          codigo: "FILTRO_INVALIDO",
        }),
        expect.objectContaining({
          campo: "recomenda",
          codigo: "FILTRO_INVALIDO",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });
});
