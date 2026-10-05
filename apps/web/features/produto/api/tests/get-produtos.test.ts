import {
  ListProdutosResponseSchema,
  StatusProduto,
  type ListProdutosResponse,
} from "@repo/contracts";
import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/core/api-error";
import type { ApiClient, ApiRequestOptions } from "@/lib/api/core/types";
import { getProdutos } from "../get-produtos";

const RESPOSTA_VAZIA = {
  status: 200,
  sucesso: true,
  mensagem: "Produtos listados com sucesso.",
  dados: [],
  meta: {
    total: 0,
    pagina: 1,
    ultimaPagina: 1,
    limite: 20,
  },
} satisfies ListProdutosResponse;

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

describe("getProdutos", () => {
  it("aplica os valores padrão da query", async () => {
    const client = new ApiClientFake(RESPOSTA_VAZIA);

    const resultado = await getProdutos(client);

    expect(resultado).toBe(RESPOSTA_VAZIA);
    expect(client.requests).toHaveLength(1);

    expect(client.requests[0]).toMatchObject({
      path: "/produtos",
      method: "GET",
      query: {
        pagina: 1,
        limite: 20,
        pesquisa: undefined,
        status: undefined,
        emDestaque: undefined,
      },
    });

    expect(client.requests[0]?.responseSchema).toBe(ListProdutosResponseSchema);
  });

  it("normaliza os filtros antes de chamar o cliente", async () => {
    const client = new ApiClientFake(RESPOSTA_VAZIA);
    const controller = new AbortController();

    await getProdutos(client, {
      query: {
        pagina: "2",
        limite: "10",
        pesquisa: "  notebook  ",
        status: StatusProduto.ATIVO,
        emDestaque: "false",
      },
      signal: controller.signal,
    });

    expect(client.requests[0]).toMatchObject({
      path: "/produtos",
      method: "GET",
      query: {
        pagina: 2,
        limite: 10,
        pesquisa: "notebook",
        status: StatusProduto.ATIVO,
        emDestaque: false,
      },
      signal: controller.signal,
    });
  });

  it("não chama a API quando os filtros são inválidos", async () => {
    const client = new ApiClientFake(RESPOSTA_VAZIA);

    await expect(
      getProdutos(client, {
        query: {
          pagina: "0",
          limite: "100",
        },
      }),
    ).rejects.toMatchObject<Partial<ApiError>>({
      codigo: "FILTROS_PRODUTOS_INVALIDOS",
      categoria: "validacao",
      status: null,
      erros: expect.arrayContaining([
        expect.objectContaining({
          campo: "pagina",
          codigo: "FILTRO_INVALIDO",
        }),
        expect.objectContaining({
          campo: "limite",
          codigo: "FILTRO_INVALIDO",
        }),
      ]),
    });

    expect(client.requests).toHaveLength(0);
  });

  it("propaga a resposta devolvida pelo cliente", async () => {
    const client = new ApiClientFake(RESPOSTA_VAZIA);

    await expect(getProdutos(client)).resolves.toEqual(RESPOSTA_VAZIA);
  });
});
