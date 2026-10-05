import { describe, expect, it } from "vitest";
import { ApiError, CategoriaApiError } from "@/lib/api/core/api-error";
import { criarQueryClient, deveRepetirLeitura } from "../query-client";

function criarErro({
  categoria,
  status = null,
}: {
  categoria: CategoriaApiError;
  status?: number | null;
}): ApiError {
  return new ApiError({
    status,
    codigo: "ERRO_TESTE",
    mensagem: "Erro usado pelo teste.",
    categoria,
  });
}

describe("deveRepetirLeitura", () => {
  it.each([
    criarErro({ categoria: "rede" }),
    criarErro({ categoria: "timeout" }),
    criarErro({ categoria: "http", status: 500 }),
    criarErro({ categoria: "http", status: 503 }),
  ])("permite uma tentativa para falha transitória", (error) => {
    expect(deveRepetirLeitura(0, error)).toBe(true);
    expect(deveRepetirLeitura(1, error)).toBe(false);
  });

  it.each([
    criarErro({ categoria: "cancelada" }),
    criarErro({ categoria: "validacao" }),
    criarErro({ categoria: "resposta_invalida" }),
    criarErro({ categoria: "configuracao" }),
    criarErro({ categoria: "http", status: 400 }),
    criarErro({ categoria: "http", status: 401 }),
    criarErro({ categoria: "http", status: 403 }),
    criarErro({ categoria: "http", status: 404 }),
    criarErro({ categoria: "http", status: 409 }),
  ])("não repete uma falha não transitória", (error) => {
    expect(deveRepetirLeitura(0, error)).toBe(false);
  });

  it("não repete erros desconhecidos", () => {
    expect(deveRepetirLeitura(0, new Error("Erro desconhecido"))).toBe(false);
  });
});

describe("criarQueryClient", () => {
  it("mantém mutações sem retry automático", () => {
    const queryClient = criarQueryClient();

    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(false);
  });

  it("configura a política de retry das queries", () => {
    const queryClient = criarQueryClient();

    expect(queryClient.getDefaultOptions().queries?.retry).toBe(
      deveRepetirLeitura,
    );
  });
});
