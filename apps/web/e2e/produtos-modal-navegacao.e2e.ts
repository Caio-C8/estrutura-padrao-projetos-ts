import {
  PRODUTO_NOTEBOOK,
  PRODUTO_TECLADO,
  PRODUTO_TECLADO_ID,
  PRODUTO_TECLADO_RESUMO,
  createListProdutosResponse,
  createProdutoResponse,
} from "./fixtures/produtos";
import { expect, test } from "./support/test";

test.describe("Navegação do modal de produto", () => {
  test("fecha com Escape e restaura o foco no gatilho", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse(),
    }));

    await page.goto("/produtos");

    const trigger = page.getByRole("link", {
      name: "Novo produto",
    });

    await trigger.click();

    const dialog = page.getByRole("dialog", {
      name: "Novo produto",
    });

    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL("/produtos/novo");

    await page.keyboard.press("Escape");

    await expect(page).toHaveURL("/produtos");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("protege alterações não salvas ao fechar e cancelar", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse(),
    }));

    await page.goto("/produtos");

    const trigger = page.getByRole("link", {
      name: "Novo produto",
    });

    await trigger.click();

    const dialog = page.getByRole("dialog", {
      name: "Novo produto",
    });

    const nomeInput = dialog.getByLabel(/^Nome/);

    await nomeInput.fill("Produto ainda não salvo");
    await expect(nomeInput).toHaveValue("Produto ainda não salvo");

    await dialog
      .getByRole("button", {
        name: "Fechar",
      })
      .click();

    const confirmacao = page.getByRole("alertdialog", {
      name: "Descartar alterações?",
    });

    await expect(confirmacao).toBeVisible();

    await confirmacao
      .getByRole("button", {
        name: "Continuar editando",
      })
      .click();

    await expect(confirmacao).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await expect(nomeInput).toHaveValue("Produto ainda não salvo");
    await expect(page).toHaveURL("/produtos/novo");

    await dialog
      .getByRole("button", {
        name: "Cancelar",
      })
      .click();

    await expect(confirmacao).toBeVisible();

    await confirmacao
      .getByRole("button", {
        name: "Descartar alterações",
      })
      .click();

    await expect(page).toHaveURL("/produtos");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("voltar fecha o modal e avançar o reabre", async ({ page, apiMock }) => {
    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse(),
    }));

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
    await expect(page).toHaveURL("/produtos/novo");

    await page.goBack();

    await expect(page).toHaveURL("/produtos");
    await expect(dialog).toHaveCount(0);

    await page.goForward();

    await expect(page).toHaveURL("/produtos/novo");
    await expect(dialog).toBeVisible();
  });

  test("impede fechamento e submissão duplicada durante o envio", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse(),
    }));

    let liberarEnvio!: () => void;

    const envioPendente = new Promise<void>((resolve) => {
      liberarEnvio = () => resolve();
    });

    apiMock.expectPost("/produtos", async () => {
      await envioPendente;

      return {
        status: 201,
        body: createProdutoResponse({
          produto: PRODUTO_TECLADO,
          status: 201,
          mensagem: "Produto criado com sucesso.",
        }),
      };
    });

    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse({
        dados: [PRODUTO_TECLADO_RESUMO, PRODUTO_NOTEBOOK],
        total: 2,
      }),
    }));

    apiMock.expectGet(`/produtos/${PRODUTO_TECLADO_ID}`, () => ({
      body: createProdutoResponse({
        produto: PRODUTO_TECLADO,
      }),
    }));

    await page.goto("/produtos");

    await page
      .getByRole("link", {
        name: "Novo produto",
      })
      .click();

    const dialog = page.getByRole("dialog", {
      name: "Novo produto",
    });

    await dialog.getByLabel(/^SKU/).fill("teclado-001");
    await dialog.getByLabel(/^Nome/).fill(PRODUTO_TECLADO.nome);
    await dialog.getByLabel(/^Preço/).fill("19990");

    await dialog
      .getByRole("button", {
        name: "Salvar produto",
      })
      .click();

    const submitButton = dialog.getByRole("button", {
      name: "Salvando…",
    });

    await expect(submitButton).toBeDisabled();

    await expect(
      dialog.getByRole("button", {
        name: "Cancelar",
      }),
    ).toBeDisabled();

    await expect(
      dialog.getByRole("button", {
        name: "Fechar",
      }),
    ).toBeDisabled();

    await page.keyboard.press("Escape");

    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL("/produtos/novo");

    // Mesmo que haja outra tentativa pelo teclado, o botão desabilitado
    // impede uma segunda submissão.
    await page.keyboard.press("Enter");

    await expect(submitButton).toBeDisabled();

    liberarEnvio();

    await expect(page).toHaveURL(`/produtos/${PRODUTO_TECLADO_ID}`);

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: PRODUTO_TECLADO.nome,
      }),
    ).toBeVisible();

    await expect(dialog).toHaveCount(0);
  });
});
