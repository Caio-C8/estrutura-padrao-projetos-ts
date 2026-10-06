import {
  ProdutoResponseSchema,
  StatusProduto,
  type ProdutoResponse,
} from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { updateProduto } from "../update-produto";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

const RESPOSTA = {
  status: 200,
  sucesso: true,
  mensagem: "Produto atualizado com sucesso.",
  dados: {
    id: PRODUTO_ID,
    sku: "PRODUTO-001",
    nome: "Notebook atualizado",
    descricao: null,
    urlManual: null,
    status: StatusProduto.ATIVO,
    emDestaque: false,
    estoque: 12,
    preco: "499.90",
    pesoKg: null,
    quantidadeVendas: "0",
    dataValidade: null,
    disponivelEm: null,
    createdAt: "2026-10-06T10:00:00.000Z",
    updatedAt: "2026-10-06T14:00:00.000Z",
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

describe("updateProduto", () => {
  it("valida os parâmetros e normaliza o body antes de chamar a API", async () => {
    const client = new ApiClientFake(RESPOSTA);

    const resultado = await updateProduto(client, {
      produtoId: PRODUTO_ID,
      body: {
        sku: " produto-001 ",
        nome: " Notebook atualizado ",
        status: StatusProduto.ATIVO,
      },
    });

    expect(resultado).toBe(RESPOSTA);

    expect(client.requests[0]).toMatchObject({
      path: `/produtos/${PRODUTO_ID}`,
      method: "PATCH",
      body: {
        sku: "PRODUTO-001",
        nome: "Notebook atualizado",
        status: StatusProduto.ATIVO,
      },
    });

    expect(client.requests[0]?.responseSchema).toBe(ProdutoResponseSchema);
  });

  it("não chama a API quando o identificador é inválido", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      updateProduto(client, {
        produtoId: "identificador-invalido",
        body: {
          nome: "Notebook atualizado",
        },
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

  it("não chama a API quando nenhum campo é informado", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      updateProduto(client, {
        produtoId: PRODUTO_ID,
        body: {},
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "DADOS_PRODUTO_INVALIDOS",
      categoria: "validacao",
    });

    expect(client.requests).toHaveLength(0);
  });

  it("não chama a API quando um campo possui valor inválido", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      updateProduto(client, {
        produtoId: PRODUTO_ID,
        body: {
          preco: "0.00",
        },
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "DADOS_PRODUTO_INVALIDOS",
      categoria: "validacao",
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "preco",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });
});
