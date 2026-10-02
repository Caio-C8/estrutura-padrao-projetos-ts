import type {
  CreateAvaliacaoProdutoData,
  ListAvaliacoesProdutoQueryData,
  UpdateAvaliacaoProdutoData,
} from "@repo/contracts";
import { AvaliacaoProdutoPersistenceMapper } from "../avaliacao-produto-persistence.mapper";

const PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";

describe("AvaliacaoProdutoPersistenceMapper", () => {
  describe("toCreateInput", () => {
    it("converte os dados de criação para o formato do Prisma", () => {
      const avaliacao = {
        autorNome: "Ana Silva",
        nota: 4,
        comentario: "Produto muito bom.",
        recomenda: true,
      } satisfies CreateAvaliacaoProdutoData;

      const resultado = AvaliacaoProdutoPersistenceMapper.toCreateInput(
        PRODUTO_ID,
        avaliacao,
      );

      expect(resultado).toEqual({
        autorNome: "Ana Silva",
        nota: 4,
        comentario: "Produto muito bom.",
        recomenda: true,
        produto: {
          connect: {
            id: PRODUTO_ID,
          },
        },
      });
    });

    it("não envia comentário quando ele não foi informado", () => {
      const avaliacao = {
        autorNome: "Ana Silva",
        nota: 4,
        recomenda: true,
      } satisfies CreateAvaliacaoProdutoData;

      const resultado = AvaliacaoProdutoPersistenceMapper.toCreateInput(
        PRODUTO_ID,
        avaliacao,
      );

      expect(resultado).toEqual({
        autorNome: "Ana Silva",
        nota: 4,
        recomenda: true,
        produto: {
          connect: {
            id: PRODUTO_ID,
          },
        },
      });

      expect(resultado).not.toHaveProperty("comentario");
    });
  });

  describe("toUpdateInput", () => {
    it("converte somente os campos informados", () => {
      const avaliacao = {
        autorNome: "Maria Souza",
        nota: 5,
      } satisfies UpdateAvaliacaoProdutoData;

      const resultado =
        AvaliacaoProdutoPersistenceMapper.toUpdateInput(avaliacao);

      expect(resultado).toEqual({
        autorNome: "Maria Souza",
        nota: 5,
      });

      expect(resultado).not.toHaveProperty("comentario");
      expect(resultado).not.toHaveProperty("recomenda");
    });

    it("preserva false no campo recomenda", () => {
      const avaliacao = {
        recomenda: false,
      } satisfies UpdateAvaliacaoProdutoData;

      const resultado =
        AvaliacaoProdutoPersistenceMapper.toUpdateInput(avaliacao);

      expect(resultado).toEqual({
        recomenda: false,
      });
    });

    it("preserva null para remover o comentário", () => {
      const avaliacao = {
        comentario: null,
      } satisfies UpdateAvaliacaoProdutoData;

      const resultado =
        AvaliacaoProdutoPersistenceMapper.toUpdateInput(avaliacao);

      expect(resultado).toEqual({
        comentario: null,
      });
    });
  });

  describe("toWhere", () => {
    it("sempre limita a pesquisa ao produto informado", () => {
      const query = {
        pagina: 1,
        limite: 20,
      } satisfies ListAvaliacoesProdutoQueryData;

      const resultado = AvaliacaoProdutoPersistenceMapper.toWhere(
        PRODUTO_ID,
        query,
      );

      expect(resultado).toEqual({
        produtoId: PRODUTO_ID,
      });
    });

    it("adiciona pesquisa pelo nome do autor", () => {
      const query = {
        pagina: 1,
        limite: 20,
        pesquisa: "Ana",
      } satisfies ListAvaliacoesProdutoQueryData;

      const resultado = AvaliacaoProdutoPersistenceMapper.toWhere(
        PRODUTO_ID,
        query,
      );

      expect(resultado).toEqual({
        produtoId: PRODUTO_ID,
        autorNome: {
          contains: "Ana",
          mode: "insensitive",
        },
      });
    });

    it("adiciona o filtro recomenda com valor true", () => {
      const query = {
        pagina: 1,
        limite: 20,
        recomenda: true,
      } satisfies ListAvaliacoesProdutoQueryData;

      const resultado = AvaliacaoProdutoPersistenceMapper.toWhere(
        PRODUTO_ID,
        query,
      );

      expect(resultado).toEqual({
        produtoId: PRODUTO_ID,
        recomenda: true,
      });
    });

    it("preserva false no filtro recomenda", () => {
      const query = {
        pagina: 1,
        limite: 20,
        recomenda: false,
      } satisfies ListAvaliacoesProdutoQueryData;

      const resultado = AvaliacaoProdutoPersistenceMapper.toWhere(
        PRODUTO_ID,
        query,
      );

      expect(resultado).toEqual({
        produtoId: PRODUTO_ID,
        recomenda: false,
      });
    });

    it("combina pesquisa e recomendação", () => {
      const query = {
        pagina: 2,
        limite: 10,
        pesquisa: "Ana",
        recomenda: false,
      } satisfies ListAvaliacoesProdutoQueryData;

      const resultado = AvaliacaoProdutoPersistenceMapper.toWhere(
        PRODUTO_ID,
        query,
      );

      expect(resultado).toEqual({
        produtoId: PRODUTO_ID,
        autorNome: {
          contains: "Ana",
          mode: "insensitive",
        },
        recomenda: false,
      });
    });
  });
});
