import {
  PRODUTO_TECLADO,
  PRODUTO_TECLADO_ATUALIZADO,
  PRODUTO_TECLADO_ID,
  createListProdutosResponse,
  createProdutoResponse,
} from "./fixtures/produtos";
import { createErrorResponse } from "./fixtures/respostas";
import { expect, test } from "./support/test";

const PRODUTO_PATH = `/produtos/${PRODUTO_TECLADO_ID}`;

test.describe("Edição e exclusão de produto", () => {
  test("edita somente o campo alterado pelo modal", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet(
      PRODUTO_PATH,
      () => ({
        body: createProdutoResponse({
          produto: PRODUTO_TECLADO,
        }),
      }),
      2,
    );

    apiMock.expectPatch(PRODUTO_PATH, ({ body }) => {
      expect(body).toEqual({
        nome: PRODUTO_TECLADO_ATUALIZADO.nome,
      });

      return {
        body: createProdutoResponse({
          produto: PRODUTO_TECLADO_ATUALIZADO,
          mensagem: "Produto atualizado com sucesso.",
        }),
      };
    });

    await page.goto(PRODUTO_PATH);

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: PRODUTO_TECLADO.nome,
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: "Editar produto",
      })
      .click();

    await expect(page).toHaveURL(`${PRODUTO_PATH}/editar`);

    const dialog = page.getByRole("dialog", {
      name: "Editar produto",
    });

    await expect(dialog).toBeVisible();

    const nomeInput = dialog.getByLabel(/^Nome/);

    await expect(nomeInput).toHaveValue(PRODUTO_TECLADO.nome);

    await nomeInput.fill(PRODUTO_TECLADO_ATUALIZADO.nome);

    await dialog
      .getByRole("button", {
        name: "Salvar alterações",
      })
      .click();

    await expect(page).toHaveURL(PRODUTO_PATH);

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: PRODUTO_TECLADO_ATUALIZADO.nome,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Produto atualizado com sucesso.", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(dialog).toHaveCount(0);
  });

  test("exclui o produto após confirmação e retorna para a lista", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet(PRODUTO_PATH, () => ({
      body: createProdutoResponse({
        produto: PRODUTO_TECLADO,
      }),
    }));

    apiMock.expectDelete(PRODUTO_PATH, () => ({
      status: 204,
    }));

    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse(),
    }));

    await page.goto(PRODUTO_PATH);

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: PRODUTO_TECLADO.nome,
      }),
    ).toBeVisible();

    await page
      .getByRole("button", {
        name: "Excluir produto",
      })
      .click();

    const alertDialog = page.getByRole("alertdialog", {
      name: "Excluir este produto?",
    });

    await expect(alertDialog).toBeVisible();

    await expect(alertDialog).toContainText(
      `Ao excluir “${PRODUTO_TECLADO.nome}”, suas avaliações também serão excluídas.`,
    );

    await alertDialog
      .getByRole("button", {
        name: "Excluir definitivamente",
      })
      .click();

    await expect(page).toHaveURL("/produtos");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Produtos",
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Produto excluído com sucesso.", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("O produto e suas avaliações foram removidos.", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(alertDialog).toHaveCount(0);
  });

  test("mantém a confirmação aberta quando a exclusão falha", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet(PRODUTO_PATH, () => ({
      body: createProdutoResponse({
        produto: PRODUTO_TECLADO,
      }),
    }));

    apiMock.expectDelete(PRODUTO_PATH, () => ({
      status: 503,
      body: createErrorResponse({
        status: 503,
        mensagem: "Serviço temporariamente indisponível.",
        requisicaoId: "e2e-delete-product-error",
      }),
    }));

    await page.goto(PRODUTO_PATH);

    await page
      .getByRole("button", {
        name: "Excluir produto",
      })
      .click();

    const alertDialog = page.getByRole("alertdialog", {
      name: "Excluir este produto?",
    });

    await alertDialog
      .getByRole("button", {
        name: "Excluir definitivamente",
      })
      .click();

    const errorAlert = alertDialog.getByRole("alert");

    await expect(errorAlert).toContainText(
      "Não foi possível excluir o produto",
    );

    await expect(errorAlert).toContainText(
      "Serviço temporariamente indisponível.",
    );

    await expect(errorAlert).toContainText(
      "Referência: e2e-delete-product-error",
    );

    await expect(page).toHaveURL(PRODUTO_PATH);
    await expect(alertDialog).toBeVisible();

    await expect(
      alertDialog.getByRole("button", {
        name: "Excluir definitivamente",
      }),
    ).toBeEnabled();
  });
});
