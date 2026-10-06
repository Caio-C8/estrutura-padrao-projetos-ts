// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { StatusProduto, type ProdutoResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { CreateProdutoForm } from "../create-produto-form";

const replaceMock = vi.hoisted(() => vi.fn());
const mutateAsyncMock = vi.hoisted(() => vi.fn());
const resetMutationMock = vi.hoisted(() => vi.fn());
const useCreateProdutoMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/features/produto/api/use-create-produto", () => ({
  useCreateProduto: useCreateProdutoMock,
}));

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

function preencherCamposObrigatorios() {
  fireEvent.change(screen.getByLabelText(/^SKU/), {
    target: {
      value: "produto-001",
    },
  });

  fireEvent.change(screen.getByLabelText(/^Nome/), {
    target: {
      value: "Notebook profissional",
    },
  });

  fireEvent.change(screen.getByLabelText(/^Preço/), {
    target: {
      value: "37098",
    },
  });
}

beforeEach(() => {
  useCreateProdutoMock.mockReturnValue({
    mutateAsync: mutateAsyncMock,
    reset: resetMutationMock,
    isPending: false,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CreateProdutoForm", () => {
  it("exibe os erros de validação junto aos campos", async () => {
    render(<CreateProdutoForm />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar produto",
      }),
    );

    expect(await screen.findByText("O SKU é obrigatório.")).toBeDefined();

    expect(screen.getByText("O nome é obrigatório.")).toBeDefined();

    expect(
      screen.getByText("O preço deve ser maior ou igual a 0.01."),
    ).toBeDefined();

    expect(screen.getByLabelText(/^SKU/).getAttribute("aria-invalid")).toBe(
      "true",
    );

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("transforma os valores, cria o produto e navega para o detalhe", async () => {
    mutateAsyncMock.mockResolvedValue(RESPOSTA);

    render(<CreateProdutoForm />);

    preencherCamposObrigatorios();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar produto",
      }),
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledOnce();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      sku: "PRODUTO-001",
      nome: "Notebook profissional",
      status: StatusProduto.RASCUNHO,
      emDestaque: true,
      estoque: 0,
      preco: "370.98",
    });

    expect(resetMutationMock).toHaveBeenCalledOnce();

    expect(replaceMock).toHaveBeenCalledWith(`/produtos/${PRODUTO_ID}`);
  });

  it("mostra o erro da API abaixo do campo correspondente", async () => {
    mutateAsyncMock.mockRejectedValue(
      new ApiError({
        status: 409,
        codigo: "SKU_PRODUTO_JA_EXISTENTE",
        mensagem: "Já existe um produto com o SKU informado.",
        categoria: "http",
        erros: [
          {
            campo: "sku",
            codigo: "VALOR_JA_EXISTENTE",
            mensagem: "Já existe um produto com este SKU.",
          },
        ],
      }),
    );

    render(<CreateProdutoForm />);

    preencherCamposObrigatorios();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar produto",
      }),
    );

    expect(
      await screen.findByText("Já existe um produto com este SKU."),
    ).toBeDefined();

    expect(screen.getByLabelText(/^SKU/).getAttribute("aria-invalid")).toBe(
      "true",
    );

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("mostra um erro geral quando a falha não pertence a um campo", async () => {
    mutateAsyncMock.mockRejectedValue(
      new ApiError({
        status: null,
        codigo: "API_INDISPONIVEL",
        mensagem: "Não foi possível conectar com o serviço.",
        categoria: "rede",
      }),
    );

    render(<CreateProdutoForm />);

    preencherCamposObrigatorios();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar produto",
      }),
    );

    expect(
      await screen.findByText("Não foi possível conectar com o serviço."),
    ).toBeDefined();

    expect(screen.getByRole("alert")).toBeDefined();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("desabilita a submissão enquanto a criação está pendente", () => {
    useCreateProdutoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      reset: resetMutationMock,
      isPending: true,
    });

    render(<CreateProdutoForm />);

    const botao = screen.getByRole("button", {
      name: "Salvando…",
    });

    expect(botao.hasAttribute("disabled")).toBe(true);
  });

  it("aplica máscaras de preço e peso da direita para a esquerda", () => {
    render(<CreateProdutoForm />);

    const preco = screen.getByLabelText(/^Preço/) as HTMLInputElement;

    fireEvent.change(preco, {
      target: {
        value: "1",
      },
    });

    expect(preco.value).toBe("0,01");

    fireEvent.change(preco, {
      target: {
        value: "0,012",
      },
    });

    expect(preco.value).toBe("0,12");

    fireEvent.change(preco, {
      target: {
        value: "0,123",
      },
    });

    expect(preco.value).toBe("1,23");

    const peso = screen.getByLabelText(/^Peso/) as HTMLInputElement;

    fireEvent.change(peso, {
      target: {
        value: "150",
      },
    });

    expect(peso.value).toBe("1,50");
  });
});
