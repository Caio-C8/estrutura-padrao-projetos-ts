// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  StatusProduto,
  type ProdutoDetalhadoResponse,
  type ProdutoResponse,
} from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { UpdateProdutoForm } from "../update-produto-form";

const replaceMock = vi.hoisted(() => vi.fn());
const mutateAsyncMock = vi.hoisted(() => vi.fn());
const resetMutationMock = vi.hoisted(() => vi.fn());
const useUpdateProdutoMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccessMock,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/features/produto/api/use-update-produto", () => ({
  useUpdateProduto: useUpdateProdutoMock,
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";

const PRODUTO = {
  id: PRODUTO_ID,
  sku: "PRODUTO-001",
  nome: "Notebook profissional",
  descricao: "Produto para uso profissional.",
  urlManual: "https://example.com/manual",
  status: StatusProduto.ATIVO,
  emDestaque: true,
  estoque: 10,
  preco: "370.98",
  pesoKg: 1.235,
  quantidadeVendas: "0",
  dataValidade: "2029-10-01",
  disponivelEm: null,
  createdAt: "2026-10-06T10:00:00.000Z",
  updatedAt: "2026-10-06T10:00:00.000Z",
} satisfies ProdutoDetalhadoResponse;

const RESPOSTA_ATUALIZADA = {
  status: 200,
  sucesso: true,
  mensagem: "Produto atualizado com sucesso.",
  dados: {
    ...PRODUTO,
    nome: "Notebook atualizado",
    updatedAt: "2026-10-06T14:00:00.000Z",
  },
} satisfies ProdutoResponse;

beforeEach(() => {
  useUpdateProdutoMock.mockReturnValue({
    mutateAsync: mutateAsyncMock,
    reset: resetMutationMock,
    isPending: false,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UpdateProdutoForm", () => {
  it("preenche o formulário com os valores atuais", () => {
    render(<UpdateProdutoForm produto={PRODUTO} />);

    expect((screen.getByLabelText(/^SKU/) as HTMLInputElement).value).toBe(
      "PRODUTO-001",
    );

    expect((screen.getByLabelText(/^Nome/) as HTMLInputElement).value).toBe(
      "Notebook profissional",
    );

    expect((screen.getByLabelText(/^Preço/) as HTMLInputElement).value).toBe(
      "370,98",
    );

    expect((screen.getByLabelText(/^Peso/) as HTMLInputElement).value).toBe(
      "1,24",
    );
  });

  it("mantém o botão desabilitado enquanto não há alterações", () => {
    render(<UpdateProdutoForm produto={PRODUTO} />);

    const botao = screen.getByRole("button", {
      name: "Salvar alterações",
    });

    expect(botao.hasAttribute("disabled")).toBe(true);
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("envia somente os campos alterados e navega para o detalhe", async () => {
    mutateAsyncMock.mockResolvedValue(RESPOSTA_ATUALIZADA);

    render(<UpdateProdutoForm produto={PRODUTO} />);

    fireEvent.change(screen.getByLabelText(/^Nome/), {
      target: {
        value: "Notebook atualizado",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar alterações",
      }),
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledOnce();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      nome: "Notebook atualizado",
    });

    expect(resetMutationMock).toHaveBeenCalledOnce();

    expect(toastSuccessMock).toHaveBeenCalledWith(RESPOSTA_ATUALIZADA.mensagem);

    expect(replaceMock).toHaveBeenCalledWith(`/produtos/${PRODUTO_ID}`);
  });

  it("envia null quando um campo anulável é apagado", async () => {
    mutateAsyncMock.mockResolvedValue({
      ...RESPOSTA_ATUALIZADA,
      dados: {
        ...RESPOSTA_ATUALIZADA.dados,
        descricao: null,
      },
    });

    render(<UpdateProdutoForm produto={PRODUTO} />);

    fireEvent.change(screen.getByLabelText("Descrição"), {
      target: {
        value: "",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar alterações",
      }),
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledOnce();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      descricao: null,
    });
  });

  it("exibe o erro da API abaixo do campo correspondente", async () => {
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

    render(<UpdateProdutoForm produto={PRODUTO} />);

    fireEvent.change(screen.getByLabelText(/^SKU/), {
      target: {
        value: "produto-duplicado",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar alterações",
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

  it("delega o cancelamento quando o consumidor fornece callback", () => {
    const onCancel = vi.fn();

    render(<UpdateProdutoForm produto={PRODUTO} onCancel={onCancel} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancelar",
      }),
    );

    expect(onCancel).toHaveBeenCalledOnce();

    expect(
      screen.queryByRole("link", {
        name: "Cancelar",
      }),
    ).toBeNull();
  });

  it("delega a navegação de sucesso quando o consumidor fornece callback", async () => {
    mutateAsyncMock.mockResolvedValue(RESPOSTA_ATUALIZADA);

    const onSuccess = vi.fn();

    render(<UpdateProdutoForm produto={PRODUTO} onSuccess={onSuccess} />);

    fireEvent.change(screen.getByLabelText(/^Nome/), {
      target: {
        value: "Notebook atualizado",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar alterações",
      }),
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(RESPOSTA_ATUALIZADA);
    });

    expect(toastSuccessMock).toHaveBeenCalledWith(RESPOSTA_ATUALIZADA.mensagem);

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("informa quando o formulário possui alterações", async () => {
    const onStateChange = vi.fn();

    render(
      <UpdateProdutoForm produto={PRODUTO} onStateChange={onStateChange} />,
    );

    await waitFor(() => {
      expect(onStateChange).toHaveBeenCalledWith({
        possuiAlteracoes: false,
        enviando: false,
      });
    });

    fireEvent.change(screen.getByLabelText(/^Nome/), {
      target: {
        value: "Notebook atualizado",
      },
    });

    await waitFor(() => {
      expect(onStateChange).toHaveBeenLastCalledWith({
        possuiAlteracoes: true,
        enviando: false,
      });
    });
  });

  it("desabilita os controles enquanto a atualização está pendente", async () => {
    const onStateChange = vi.fn();

    useUpdateProdutoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      reset: resetMutationMock,
      isPending: true,
    });

    render(
      <UpdateProdutoForm produto={PRODUTO} onStateChange={onStateChange} />,
    );

    expect(
      screen
        .getByRole("button", {
          name: "Salvando…",
        })
        .hasAttribute("disabled"),
    ).toBe(true);

    const inputNome = screen.getByLabelText(/^Nome/) as HTMLInputElement;
    const fieldset = inputNome.closest("fieldset");

    expect(fieldset).not.toBeNull();
    expect((fieldset as HTMLFieldSetElement).disabled).toBe(true);

    await waitFor(() => {
      expect(onStateChange).toHaveBeenCalledWith({
        possuiAlteracoes: false,
        enviando: true,
      });
    });
  });
});
