// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ProdutoExcluidoFeedback } from "../produto-excluido-feedback";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("ProdutoExcluidoFeedback", () => {
  it("exibe a confirmação e remove o marcador da URL", async () => {
    window.history.replaceState(
      null,
      "",
      "/produtos?resultado=produto-excluido",
    );

    render(<ProdutoExcluidoFeedback />);

    expect(screen.getByText("Produto excluído com sucesso")).toBeDefined();

    await waitFor(() => {
      expect(window.location.pathname).toBe("/produtos");
      expect(window.location.search).toBe("");
    });
  });
});
