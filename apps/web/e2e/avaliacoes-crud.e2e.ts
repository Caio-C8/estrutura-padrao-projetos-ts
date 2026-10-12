import {
  AVALIACAO_JOAO,
  AVALIACAO_JOAO_ATUALIZADA,
  AVALIACAO_JOAO_ID,
  AVALIACAO_JOAO_RESUMO,
  AVALIACAO_MARIA_RESUMO,
  createAvaliacaoProdutoResponse,
  createListAvaliacoesProdutoResponse,
} from "./fixtures/avaliacoes";
import { PRODUTO_NOTEBOOK_ID } from "./fixtures/produtos";
import { expect, test } from "./support/test";

const LIST_PATH = `/produtos/${PRODUTO_NOTEBOOK_ID}/avaliacoes`;

const DETAIL_PATH = `${LIST_PATH}/${AVALIACAO_JOAO_ID}`;

test.describe("CRUD de avaliações", () => {
  test("lista, cria, edita e exclui uma avaliação", async ({
    page,
    apiMock,
  }) => {
    apiMock.expectGet(LIST_PATH, ({ url }) => {
      expect(Object.fromEntries(url.searchParams)).toEqual({
        limite: "20",
        pagina: "1",
      });

      return {
        body: createListAvaliacoesProdutoResponse(),
      };
    });

    apiMock.expectPost(LIST_PATH, ({ body }) => {
      expect(body).toEqual({
        autorNome: AVALIACAO_JOAO.autorNome,
        nota: 5,
        comentario: AVALIACAO_JOAO.comentario,
        recomenda: true,
      });

      return {
        status: 201,
        body: createAvaliacaoProdutoResponse({
          avaliacao: AVALIACAO_JOAO,
          status: 201,
          mensagem: "Avaliação criada com sucesso.",
        }),
      };
    });

    apiMock.expectGet(LIST_PATH, () => ({
      body: createListAvaliacoesProdutoResponse({
        dados: [AVALIACAO_JOAO_RESUMO, AVALIACAO_MARIA_RESUMO],
        total: 2,
      }),
    }));

    apiMock.expectGet(
      DETAIL_PATH,
      () => ({
        body: createAvaliacaoProdutoResponse({
          avaliacao: AVALIACAO_JOAO,
        }),
      }),
      2,
    );

    apiMock.expectPatch(DETAIL_PATH, ({ body }) => {
      expect(body).toEqual({
        nota: 4,
      });

      return {
        body: createAvaliacaoProdutoResponse({
          avaliacao: AVALIACAO_JOAO_ATUALIZADA,
          mensagem: "Avaliação atualizada com sucesso.",
        }),
      };
    });

    apiMock.expectDelete(DETAIL_PATH, () => ({
      status: 204,
    }));

    apiMock.expectGet(LIST_PATH, () => ({
      body: createListAvaliacoesProdutoResponse({
        dados: [AVALIACAO_MARIA_RESUMO],
        total: 1,
      }),
    }));

    await page.goto(LIST_PATH);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Avaliações do produto",
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: "Ver detalhes da avaliação de Maria",
      }),
    ).toBeVisible();

    await page
      .getByRole("link", {
        name: "Nova avaliação",
      })
      .click();

    await expect(page).toHaveURL(`${LIST_PATH}/nova`);

    const createDialog = page.getByRole("dialog", {
      name: "Nova avaliação",
    });

    await expect(createDialog).toBeVisible();

    await createDialog
      .getByLabel(/^Nome do autor/)
      .fill(AVALIACAO_JOAO.autorNome);

    await createDialog
      .getByRole("radio", {
        name: "5 estrelas",
      })
      .click();

    await createDialog.getByLabel("Comentário").fill(AVALIACAO_JOAO.comentario);

    await expect(
      createDialog.getByRole("checkbox", {
        name: "Recomenda o produto",
      }),
    ).toBeChecked();

    await createDialog
      .getByRole("button", {
        name: "Salvar avaliação",
      })
      .click();

    await expect(page).toHaveURL(DETAIL_PATH);

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: AVALIACAO_JOAO.autorNome,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Avaliação criada com sucesso.", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(createDialog).toHaveCount(0);

    await page
      .getByRole("link", {
        name: "Editar avaliação",
      })
      .click();

    await expect(page).toHaveURL(`${DETAIL_PATH}/editar`);

    const editDialog = page.getByRole("dialog", {
      name: "Editar avaliação",
    });

    await expect(editDialog).toBeVisible();

    await expect(
      editDialog.getByRole("radio", {
        name: "5 estrelas",
      }),
    ).toBeChecked();

    await editDialog
      .getByRole("radio", {
        name: "4 estrelas",
      })
      .click();

    await editDialog
      .getByRole("button", {
        name: "Salvar alterações",
      })
      .click();

    await expect(page).toHaveURL(DETAIL_PATH);

    await expect(page.getByLabel("Nota 4 de 5")).toBeVisible();

    await expect(
      page.getByText("Avaliação atualizada com sucesso.", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(editDialog).toHaveCount(0);

    await page
      .getByRole("button", {
        name: "Excluir avaliação",
      })
      .click();

    const deleteDialog = page.getByRole("alertdialog", {
      name: "Excluir esta avaliação?",
    });

    await expect(deleteDialog).toContainText(
      `Ao excluir a avaliação de “${AVALIACAO_JOAO.autorNome}”`,
    );

    await deleteDialog
      .getByRole("button", {
        name: "Excluir definitivamente",
      })
      .click();

    await expect(page).toHaveURL(LIST_PATH);

    await expect(
      page.getByText("Avaliação excluída com sucesso.", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", {
        name: `Ver detalhes da avaliação de ${AVALIACAO_JOAO.autorNome}`,
      }),
    ).toHaveCount(0);

    await expect(
      page.getByRole("link", {
        name: "Ver detalhes da avaliação de Maria",
      }),
    ).toBeVisible();

    await expect(deleteDialog).toHaveCount(0);
  });
});
