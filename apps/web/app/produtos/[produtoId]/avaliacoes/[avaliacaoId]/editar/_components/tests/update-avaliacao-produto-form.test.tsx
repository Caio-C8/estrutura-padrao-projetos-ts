// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AvaliacaoProdutoDetalhadoResponse,
  AvaliacaoProdutoResponse,
} from "@repo/contracts";
import { ApiError } from "@/lib/api/core/api-error";
import { UpdateAvaliacaoProdutoForm } from "../update-avaliacao-produto-form";

const replaceMock = vi.hoisted(() => vi.fn());
const mutateAsyncMock = vi.hoisted(() => vi.fn());
const resetMutationMock = vi.hoisted(() => vi.fn());
const useUpdateAvaliacaoProdutoMock = vi.hoisted(() => vi.fn());
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

vi.mock("@/features/produto/api/use-update-avaliacao-produto", () => ({
  useUpdateAvaliacaoProduto: useUpdateAvaliacaoProdutoMock,
}));

const PRODUTO_ID = "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4";
const AVALIACAO_ID = "b48298c4-d9e5-4713-8e1b-983b6380fe43";

const AVALIACAO = {
  id: AVALIACAO_ID,
  produtoId: PRODUTO_ID,
  autorNome: "Maria",
  nota: 5,
  comentario: "Produto excelente.",
  recomenda: true,
  createdAt: "2026-10-08T10:00:00.000Z",
  updatedAt: "2026-10-08T10:00:00.000Z",
} satisfies AvaliacaoProdutoDetalhadoResponse;

const RESPOSTA_ATUALIZADA = {
  status: 200,
  sucesso: true,
  mensagem: "Avaliação atualizada com sucesso.",
  dados: {
    ...AVALIACAO,
    nota: 4,
    updatedAt: "2026-10-09T14:00:00.000Z",
  },
} satisfies AvaliacaoProdutoResponse;

beforeEach(() => {
  useUpdateAvaliacaoProdutoMock.mockReturnValue({
    mutateAsync: mutateAsyncMock,
    reset: resetMutationMock,
    isPending: false,
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("UpdateAvaliacaoProdutoForm", () => {
  it("preenche o formulário com os valores atuais", () => {
    render(<UpdateAvaliacaoProdutoForm avaliacao={AVALIACAO} />);

    expect(
      (screen.getByLabelText(/^Nome do autor/) as HTMLInputElement).value,
    ).toBe("Maria");

    expect(
      (screen.getByLabelText("Comentário") as HTMLTextAreaElement).value,
    ).toBe("Produto excelente.");

    expect(
      screen
        .getByRole("radio", {
          name: "5 estrelas",
        })
        .getAttribute("aria-checked"),
    ).toBe("true");

    expect(
      screen
        .getByRole("checkbox", {
          name: "Recomenda o produto",
        })
        .getAttribute("data-state"),
    ).toBe("checked");
  });

  it("mantém o botão desabilitado enquanto não há alterações", () => {
    render(<UpdateAvaliacaoProdutoForm avaliacao={AVALIACAO} />);

    const botao = screen.getByRole("button", {
      name: "Salvar alterações",
    });

    expect(botao.hasAttribute("disabled")).toBe(true);

    expect(
      screen.getByText("Altere pelo menos um campo para salvar."),
    ).toBeDefined();

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("envia somente os campos alterados, exibe o toast e navega", async () => {
    mutateAsyncMock.mockResolvedValue(RESPOSTA_ATUALIZADA);

    render(<UpdateAvaliacaoProdutoForm avaliacao={AVALIACAO} />);

    fireEvent.click(
      screen.getByRole("radio", {
        name: "4 estrelas",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar alterações",
      }),
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledOnce();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      nota: 4,
    });

    expect(resetMutationMock).toHaveBeenCalledOnce();

    expect(toastSuccessMock).toHaveBeenCalledWith(RESPOSTA_ATUALIZADA.mensagem);

    expect(replaceMock).toHaveBeenCalledWith(
      `/produtos/${PRODUTO_ID}/avaliacoes/${AVALIACAO_ID}`,
    );
  });

  it("envia null quando o comentário é apagado", async () => {
    mutateAsyncMock.mockResolvedValue({
      ...RESPOSTA_ATUALIZADA,
      dados: {
        ...RESPOSTA_ATUALIZADA.dados,
        comentario: null,
      },
    });

    render(<UpdateAvaliacaoProdutoForm avaliacao={AVALIACAO} />);

    fireEvent.change(screen.getByLabelText("Comentário"), {
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
      comentario: null,
    });
  });

  it("envia false quando a recomendação é desmarcada", async () => {
    mutateAsyncMock.mockResolvedValue({
      ...RESPOSTA_ATUALIZADA,
      dados: {
        ...RESPOSTA_ATUALIZADA.dados,
        recomenda: false,
      },
    });

    render(<UpdateAvaliacaoProdutoForm avaliacao={AVALIACAO} />);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Recomenda o produto",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar alterações",
      }),
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledOnce();
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      recomenda: false,
    });
  });

  it("exibe o erro da API abaixo do campo correspondente", async () => {
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

    render(<UpdateAvaliacaoProdutoForm avaliacao={AVALIACAO} />);

    fireEvent.change(screen.getByLabelText("Comentário"), {
      target: {
        value: "Comentário alterado.",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar alterações",
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

  it("exibe erro geral quando a falha não pertence a um campo", async () => {
    mutateAsyncMock.mockRejectedValue(
      new ApiError({
        status: 404,
        codigo: "AVALIACAO_PRODUTO_NAO_ENCONTRADA",
        mensagem: "A avaliação informada não foi encontrada.",
        categoria: "http",
      }),
    );

    render(<UpdateAvaliacaoProdutoForm avaliacao={AVALIACAO} />);

    fireEvent.change(screen.getByLabelText(/^Nome do autor/), {
      target: {
        value: "Maria atualizada",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Salvar alterações",
      }),
    );

    expect(
      await screen.findByText("A avaliação informada não foi encontrada."),
    ).toBeDefined();

    expect(screen.getByRole("alert")).toBeDefined();
    expect(replaceMock).not.toHaveBeenCalled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it("desabilita os controles enquanto a atualização está pendente", () => {
    useUpdateAvaliacaoProdutoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      reset: resetMutationMock,
      isPending: true,
    });

    render(<UpdateAvaliacaoProdutoForm avaliacao={AVALIACAO} />);

    expect(
      screen
        .getByRole("button", {
          name: "Salvando…",
        })
        .hasAttribute("disabled"),
    ).toBe(true);

    const inputAutor = screen.getByLabelText(
      /^Nome do autor/,
    ) as HTMLInputElement;

    const fieldset = inputAutor.closest("fieldset");

    expect(fieldset).not.toBeNull();
    expect((fieldset as HTMLFieldSetElement).disabled).toBe(true);
  });
});
