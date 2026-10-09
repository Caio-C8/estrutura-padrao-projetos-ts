// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AvaliacaoProdutoResponse } from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { CreateAvaliacaoProdutoForm } from "../create-avaliacao-produto-form";

const replaceMock = vi.hoisted(() => vi.fn());
const mutateAsyncMock = vi.hoisted(() => vi.fn());
const resetMutationMock = vi.hoisted(() => vi.fn());
const useCreateAvaliacaoProdutoMock = vi.hoisted(() => vi.fn());
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

vi.mock("@/features/produto/api/use-create-avaliacao-produto", () => ({
  useCreateAvaliacaoProduto: useCreateAvaliacaoProdutoMock,
}));

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

function preencherCamposObrigatorios() {
  fireEvent.change(screen.getByLabelText(/^Nome do autor/), {
    target: {
      value: " Maria ",
    },
  });

  fireEvent.click(
    screen.getByRole("radio", {
      name: "5 estrelas",
    }),
  );
}

beforeEach(() => {
  useCreateAvaliacaoProdutoMock.mockReturnValue({
    mutateAsync: mutateAsyncMock,
    reset: resetMutationMock,
    isPending: false,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CreateAvaliacaoProdutoForm", () => {
  it("exibe os erros de validação junto aos campos", async () => {
    render(<CreateAvaliacaoProdutoForm produtoId={PRODUTO_ID} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar avaliação",
      }),
    );

    expect(
      await screen.findByText("O nome do autor é obrigatório."),
    ).toBeDefined();

    expect(screen.getByText("Selecione uma nota entre 1 e 5.")).toBeDefined();

    expect(
      screen.getByLabelText(/^Nome do autor/).getAttribute("aria-invalid"),
    ).toBe("true");

    expect(
      screen
        .getByRole("radiogroup", {
          name: /Nota/,
        })
        .getAttribute("aria-invalid"),
    ).toBe("true");

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("seleciona a nota usando as estrelas", () => {
    render(<CreateAvaliacaoProdutoForm produtoId={PRODUTO_ID} />);

    const quartaEstrela = screen.getByRole("radio", {
      name: "4 estrelas",
    });

    fireEvent.click(quartaEstrela);

    expect(quartaEstrela.getAttribute("aria-checked")).toBe("true");

    expect(screen.getByText("4 estrelas selecionadas")).toBeDefined();
  });

  it("transforma os dados, exibe o toast e navega ao detalhe", async () => {
    mutateAsyncMock.mockResolvedValue(RESPOSTA);

    render(<CreateAvaliacaoProdutoForm produtoId={PRODUTO_ID} />);

    preencherCamposObrigatorios();

    fireEvent.change(screen.getByLabelText("Comentário"), {
      target: {
        value: " Produto excelente. ",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar avaliação",
      }),
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledOnce();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      autorNome: "Maria",
      nota: 5,
      comentario: "Produto excelente.",
      recomenda: true,
    });

    expect(resetMutationMock).toHaveBeenCalledOnce();

    expect(toastSuccessMock).toHaveBeenCalledWith(RESPOSTA.mensagem);

    expect(replaceMock).toHaveBeenCalledWith(
      `/produtos/${PRODUTO_ID}/avaliacoes/${AVALIACAO_ID}`,
    );
  });

  it("mostra o erro da API abaixo do campo correspondente", async () => {
    mutateAsyncMock.mockRejectedValue(
      new ApiError({
        status: 400,
        codigo: "VALIDACAO_ENTRADA_INVALIDA",
        mensagem: "Os dados informados são inválidos.",
        categoria: "validacao",
        erros: [
          {
            campo: "comentario",
            codigo: "TAMANHO_INVALIDO",
            mensagem: "O comentário deve possuir no máximo 1000 caracteres.",
          },
        ],
      }),
    );

    render(<CreateAvaliacaoProdutoForm produtoId={PRODUTO_ID} />);

    preencherCamposObrigatorios();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar avaliação",
      }),
    );

    expect(
      await screen.findByText(
        "O comentário deve possuir no máximo 1000 caracteres.",
      ),
    ).toBeDefined();

    expect(
      screen.getByLabelText("Comentário").getAttribute("aria-invalid"),
    ).toBe("true");

    expect(replaceMock).not.toHaveBeenCalled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it("mostra um erro geral quando a falha não pertence a um campo", async () => {
    mutateAsyncMock.mockRejectedValue(
      new ApiError({
        status: 404,
        codigo: "PRODUTO_NAO_ENCONTRADO",
        mensagem: "O produto informado não foi encontrado.",
        categoria: "http",
      }),
    );

    render(<CreateAvaliacaoProdutoForm produtoId={PRODUTO_ID} />);

    preencherCamposObrigatorios();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar avaliação",
      }),
    );

    expect(
      await screen.findByText("O produto informado não foi encontrado."),
    ).toBeDefined();

    expect(screen.getByRole("alert")).toBeDefined();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it("desabilita a submissão enquanto a criação está pendente", () => {
    useCreateAvaliacaoProdutoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      reset: resetMutationMock,
      isPending: true,
    });

    render(<CreateAvaliacaoProdutoForm produtoId={PRODUTO_ID} />);

    expect(
      screen
        .getByRole("button", {
          name: "Salvando…",
        })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
