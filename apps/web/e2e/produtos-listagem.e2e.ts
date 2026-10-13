import {
  PRODUTO_MOUSE,
  PRODUTO_NOTEBOOK,
  createListProdutosResponse,
} from "./fixtures/produtos";
import { createErrorResponse } from "./fixtures/respostas";
import { expect, test } from "./support/test";

test.describe("Listagem de produtos", () => {
  test("lista produtos e aplica filtros pela URL", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet("/produtos", ({ url }) => {
      expect(Object.fromEntries(url.searchParams)).toEqual({
        limite: "20",
        pagina: "1",
      });

      return {
        body: createListProdutosResponse(),
      };
    });

    apiMock.expectGet("/produtos", ({ url }) => {
      expect(Object.fromEntries(url.searchParams)).toEqual({
        emDestaque: "true",
        limite: "10",
        pagina: "1",
        pesquisa: "notebook",
        status: "ATIVO",
      });

      return {
        body: createListProdutosResponse({
          dados: [PRODUTO_NOTEBOOK],
          total: 1,
          limite: 10,
        }),
      };
    });

    await page.goto("/produtos");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Produtos",
      }),
    ).toBeVisible();

    const avisoExemploPublico = page.getByRole("note", {
      name: "Exemplo público e didático",
    });

    await expect(avisoExemploPublico).toContainText(
      "Este CRUD não exige autenticação.",
    );

    await expect(avisoExemploPublico).toContainText(
      "Use apenas dados fictícios",
    );

    await expect(avisoExemploPublico).toContainText(
      "não é adequado para informações reais, privadas ou sensíveis",
    );

    await expect(
      page.getByRole("link", {
        name: PRODUTO_NOTEBOOK.nome,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: PRODUTO_MOUSE.nome,
      }),
    ).toBeVisible();

    await page.getByLabel("Pesquisa").fill("notebook");
    await page.getByLabel("Status").selectOption("ATIVO");
    await page.getByLabel("Destaque").selectOption("true");
    await page.getByLabel("Itens por página").selectOption("10");

    await page
      .getByRole("button", {
        name: "Aplicar filtros",
      })
      .click();

    await expect(page).toHaveURL((url) => {
      return (
        url.pathname === "/produtos" &&
        url.searchParams.get("pesquisa") === "notebook" &&
        url.searchParams.get("status") === "ATIVO" &&
        url.searchParams.get("emDestaque") === "true" &&
        url.searchParams.get("limite") === "10"
      );
    });

    await expect(
      page.getByRole("link", {
        name: PRODUTO_NOTEBOOK.nome,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: PRODUTO_MOUSE.nome,
      }),
    ).toHaveCount(0);
  });

  test("exibe falha da API e permite tentar novamente", async ({
    page,
    apiMock,
  }) => {
    const errorResponse = createErrorResponse({
      requisicaoId: "e2e-list-products-error",
    });

    apiMock.expectGet(
      "/produtos",
      () => ({
        status: 503,
        body: errorResponse,
      }),
      2,
    );

    apiMock.expectGet("/produtos", () => ({
      body: createListProdutosResponse({
        dados: [PRODUTO_NOTEBOOK],
        total: 1,
      }),
    }));

    await page.goto("/produtos");

    const alert = page.getByRole("alert").filter({
      has: page.getByRole("heading", {
        level: 2,
        name: "Não foi possível carregar os produtos",
      }),
    });

    await expect(alert).toContainText("Não foi possível carregar os produtos");

    await expect(alert).toContainText("Serviço temporariamente indisponível.");

    await expect(alert).toContainText("Referência: e2e-list-products-error");

    await page
      .getByRole("button", {
        name: "Tentar novamente",
      })
      .click();

    await expect(
      page.getByRole("link", {
        name: PRODUTO_NOTEBOOK.nome,
      }),
    ).toBeVisible();

    await expect(alert).toHaveCount(0);
  });
});
