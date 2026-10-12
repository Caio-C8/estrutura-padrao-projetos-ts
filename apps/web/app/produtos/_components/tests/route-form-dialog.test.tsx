// @vitest-environment jsdom

import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RouteFormDialog } from "../route-form-dialog";

const backMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: backMock,
  }),
}));

function renderDialog({
  possuiAlteracoes = false,
  enviando = false,
}: Readonly<{
  possuiAlteracoes?: boolean;
  enviando?: boolean;
}> = {}) {
  return render(
    <RouteFormDialog
      titulo="Nova avaliação"
      descricao="Preencha os dados da avaliação."
      hrefRetornoFoco="/produtos/teste/avaliacoes/nova"
      possuiAlteracoes={possuiAlteracoes}
      enviando={enviando}
    >
      {({
        solicitarFechamento,
      }: {
        solicitarFechamento: () => void;
      }): ReactNode => (
        <button type="button" onClick={solicitarFechamento}>
          Cancelar formulário
        </button>
      )}
    </RouteFormDialog>,
  );
}

afterEach(() => {
  cleanup();
  backMock.mockReset();
});

describe("RouteFormDialog", () => {
  it("fecha imediatamente quando o formulário está intacto", () => {
    renderDialog();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancelar formulário",
      }),
    );

    expect(backMock).toHaveBeenCalledOnce();
  });

  it("pede confirmação antes de descartar alterações", () => {
    renderDialog({
      possuiAlteracoes: true,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar",
      }),
    );

    expect(backMock).not.toHaveBeenCalled();

    expect(
      screen.getByRole("heading", {
        name: "Descartar alterações?",
      }),
    ).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Descartar alterações",
      }),
    );

    expect(backMock).toHaveBeenCalledOnce();
  });

  it("permite continuar editando depois do aviso", () => {
    renderDialog({
      possuiAlteracoes: true,
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancelar formulário",
      }),
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Continuar editando",
      }),
    );

    expect(backMock).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("impede o fechamento durante a submissão", () => {
    renderDialog({
      possuiAlteracoes: true,
      enviando: true,
    });

    const fechar = screen.getByRole("button", {
      name: "Fechar",
    });

    expect(fechar.hasAttribute("disabled")).toBe(true);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cancelar formulário",
      }),
    );

    fireEvent.keyDown(screen.getByRole("dialog"), {
      key: "Escape",
    });

    expect(backMock).not.toHaveBeenCalled();

    expect(
      screen.queryByRole("heading", {
        name: "Descartar alterações?",
      }),
    ).toBeNull();
  });
});
