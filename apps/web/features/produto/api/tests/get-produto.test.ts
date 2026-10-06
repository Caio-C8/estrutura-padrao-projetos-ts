import {
  ProdutoResponseSchema,
  StatusProduto,
  type ProdutoResponse,
} from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { getProduto } from "../get-produto";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

const RESPOSTA = {
  status: 200,
  sucesso: true,
  mensagem: "Produto encontrado com sucesso.",
  dados: {
    id: PRODUTO_ID,
    sku: "PRODUTO-001",
    nome: "Notebook profissional",
    descricao: "Notebook destinado ao uso profissional.",
    urlManual: "https://example.com/manual",
    status: StatusProduto.ATIVO,
    emDestaque: true,
    estoque: 10,
    preco: "370.98",
    pesoKg: 1.5,
    quantidadeVendas: "5",
    dataValidade: null,
    disponivelEm: "2026-12-02T10:00:00.000Z",
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
} satisfies ProdutoResponse;

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

describe("getProduto", () => {
  it("busca o produto pelo identificador", async () => {
    const client = new ApiClientFake(RESPOSTA);
    const controller = new AbortController();

    const resultado = await getProduto(client, {
      produtoId: PRODUTO_ID,
      signal: controller.signal,
    });

    expect(resultado).toBe(RESPOSTA);
    expect(client.requests).toHaveLength(1);

    expect(client.requests[0]).toMatchObject({
      path: `/produtos/${PRODUTO_ID}`,
      method: "GET",
      signal: controller.signal,
    });

    expect(client.requests[0]?.responseSchema).toBe(ProdutoResponseSchema);
  });

  it("não chama a API quando o identificador é inválido", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      getProduto(client, {
        produtoId: "produto-invalido",
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "PRODUTO_ID_INVALIDO",
      categoria: "validacao",
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "id",
          codigo: "IDENTIFICADOR_INVALIDO",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });

  it("propaga a resposta devolvida pelo cliente", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      getProduto(client, {
        produtoId: PRODUTO_ID,
      }),
    ).resolves.toEqual(RESPOSTA);
  });
});
