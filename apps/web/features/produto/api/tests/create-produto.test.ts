import {
  ProdutoResponseSchema,
  StatusProduto,
  type ProdutoResponse,
} from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { createProduto } from "../create-produto";

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

const RESPOSTA = {
  status: 201,
  sucesso: true,
  mensagem: "Produto criado com sucesso.",
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

describe("createProduto", () => {
  it("valida e normaliza o body antes de chamar a API", async () => {
    const client = new ApiClientFake(RESPOSTA);

    const resultado = await createProduto(client, {
      body: {
        sku: " produto-001 ",
        nome: " Notebook profissional ",
        preco: "370.98",
      },
    });

    expect(resultado).toBe(RESPOSTA);

    expect(client.requests[0]).toMatchObject({
      path: "/produtos",
      method: "POST",
      body: {
        sku: "PRODUTO-001",
        nome: "Notebook profissional",
        status: StatusProduto.RASCUNHO,
        emDestaque: true,
        estoque: 0,
        preco: "370.98",
      },
    });

    expect(client.requests[0]?.responseSchema).toBe(ProdutoResponseSchema);
  });

  it("não chama a API quando o body é inválido", async () => {
    const client = new ApiClientFake(RESPOSTA);

    await expect(
      createProduto(client, {
        body: {
          sku: "",
          nome: "",
          preco: "invalido",
        },
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      status: null,
      codigo: "DADOS_PRODUTO_INVALIDOS",
      categoria: "validacao",
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "sku",
        }),
        expect.objectContaining({
          campo: "nome",
        }),
        expect.objectContaining({
          campo: "preco",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });
});
