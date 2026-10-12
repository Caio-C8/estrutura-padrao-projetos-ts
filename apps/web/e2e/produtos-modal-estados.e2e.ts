import {
  PRODUTO_TECLADO,
  PRODUTO_TECLADO_ID,
  createListProdutosResponse,
  createProdutoResponse,
} from "./fixtures/produtos";
import { createErrorResponse } from "./fixtures/respostas";
import { expect, test } from "./support/test";

const PRODUTO_PATH = `/produtos/${PRODUTO_TECLADO_ID}`;

test.describe("Estados do modal de produto", () => {
  test("mantém o formulário utilizável em viewport estreita", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse(),
    }));

    await page.setViewportSize({
      width: 360,
      height: 640,
    });

    await page.goto("/produtos");

    await page
      .getByRole("link", {
        name: "Novo produto",
      })
      .click();

    const dialog = page.getByRole("dialog", {
      name: "Novo produto",
    });

    await expect(dialog).toBeVisible();

    const limites = await dialog.evaluate((element) => {
      const rect = element.getBoundingClientRect();

      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
    });

    expect(limites.left).toBeGreaterThanOrEqual(0);
    expect(limites.top).toBeGreaterThanOrEqual(0);
    expect(limites.right).toBeLessThanOrEqual(limites.viewportWidth);
    expect(limites.bottom).toBeLessThanOrEqual(limites.viewportHeight);

    const possuiScrollHorizontal = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(possuiScrollHorizontal).toBe(false);

    const salvar = dialog.getByRole("button", {
      name: "Salvar produto",
    });

    await salvar.scrollIntoViewIfNeeded();

    await expect(salvar).toBeVisible();

    await expect(
      dialog.getByRole("button", {
        name: "Cancelar",
      }),
    ).toBeVisible();
  });

  test("exibe 404 ao carregar a edição pelo modal", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet(PRODUTO_PATH, () => ({
      body: createProdutoResponse({
        produto: PRODUTO_TECLADO,
      }),
    }));

    apiMock.expectGet(PRODUTO_PATH, () => ({
      status: 404,
      body: createErrorResponse({
        status: 404,
        codigo: "PRODUTO_NAO_ENCONTRADO",
        mensagem: "Produto não encontrado.",
        requisicaoId: "e2e-edit-product-not-found",
      }),
    }));

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

    const alert = dialog.getByRole("alert");

    await expect(alert).toContainText("Produto não encontrado");

    await expect(alert).toContainText(
      "O produto pode ter sido removido ou o endereço informado não corresponde a um produto existente.",
    );

    await expect(
      dialog.getByRole("link", {
        name: "Voltar para produtos",
      }),
    ).toHaveAttribute("href", "/produtos");
  });

  test("preserva os valores quando a atualização falha", async ({
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
        nome: "Teclado com nome em conflito",
      });

      return {
        status: 409,
        body: createErrorResponse({
          status: 409,
          codigo: "CONFLITO_PRODUTO",
          mensagem: "Já existe um produto com os dados informados.",
          requisicaoId: "e2e-update-product-conflict",
        }),
      };
    });

    await page.goto(PRODUTO_PATH);

    await page
      .getByRole("link", {
        name: "Editar produto",
      })
      .click();

    const dialog = page.getByRole("dialog", {
      name: "Editar produto",
    });

    const nomeInput = dialog.getByLabel(/^Nome/);

    await expect(nomeInput).toHaveValue(PRODUTO_TECLADO.nome);

    await nomeInput.fill("Teclado com nome em conflito");

    await dialog
      .getByRole("button", {
        name: "Salvar alterações",
      })
      .click();

    const alert = dialog.getByRole("alert");

    await expect(alert).toContainText("Não foi possível atualizar o produto");

    await expect(alert).toContainText(
      "Já existe um produto com os dados informados.",
    );

    await expect(nomeInput).toHaveValue("Teclado com nome em conflito");

    await expect(page).toHaveURL(`${PRODUTO_PATH}/editar`);
    await expect(dialog).toBeVisible();

    await expect(
      dialog.getByRole("button", {
        name: "Salvar alterações",
      }),
    ).toBeEnabled();
  });
});
