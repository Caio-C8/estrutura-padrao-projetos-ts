import {
  PRODUTO_MOUSE,
  PRODUTO_NOTEBOOK,
  PRODUTO_TECLADO,
  PRODUTO_TECLADO_ID,
  PRODUTO_TECLADO_RESUMO,
  createListProdutosResponse,
  createProdutoResponse,
} from "./fixtures/produtos";
import { expect, test } from "./support/test";

test.describe("Criação de produto", () => {
  test("cria um produto pelo modal e navega para o detalhe", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse(),
    }));

    apiMock.expectPost("/produtos", ({ body }) => {
      expect(body).toEqual({
        sku: "TECLADO-001",
        nome: "Teclado mecânico",
        status: "RASCUNHO",
        emDestaque: true,
        estoque: 0,
        preco: "199.90",
      });

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
        dados: [PRODUTO_TECLADO_RESUMO, PRODUTO_NOTEBOOK, PRODUTO_MOUSE],
        total: 3,
      }),
    }));

    apiMock.expectGet(`/produtos/${PRODUTO_TECLADO_ID}`, () => ({
      body: createProdutoResponse({
        produto: PRODUTO_TECLADO,
      }),
    }));

    await page.goto("/produtos");

    await expect(
      page.getByRole("link", {
        name: PRODUTO_NOTEBOOK.nome,
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: "Novo produto",
      })
      .click();

    await expect(page).toHaveURL("/produtos/novo");

    const dialog = page.getByRole("dialog", {
      name: "Novo produto",
    });

    await expect(dialog).toBeVisible();

    // A listagem continua renderizada e visualmente presente atrás do modal,
    // embora fique fora da árvore de acessibilidade enquanto o Dialog está aberto.
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Produtos",
        includeHidden: true,
      }),
    ).toBeVisible();

    await dialog.getByLabel(/^SKU/).fill("teclado-001");
    await dialog.getByLabel(/^Nome/).fill("Teclado mecânico");
    await dialog.getByLabel(/^Preço/).fill("19990");

    await dialog
      .getByRole("button", {
        name: "Salvar produto",
      })
      .click();

    await expect(page).toHaveURL(`/produtos/${PRODUTO_TECLADO_ID}`);

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: PRODUTO_TECLADO.nome,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Produto criado com sucesso.", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(dialog).toHaveCount(0);
  });

  test("refresh da URL do modal renderiza a página completa", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse(),
    }));

    await page.goto("/produtos");

    await expect(
      page.getByRole("link", {
        name: PRODUTO_NOTEBOOK.nome,
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: "Novo produto",
      })
      .click();

    await expect(
      page.getByRole("dialog", {
        name: "Novo produto",
      }),
    ).toBeVisible();

    await page.reload();

    await expect(page).toHaveURL("/produtos/novo");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Novo produto",
      }),
    ).toBeVisible();

    await expect(page.getByRole("dialog")).toHaveCount(0);

    await expect(page).toHaveTitle(/^Novo produto \| .+/);
  });
});
