import {
  StatusProduto,
  type CreateProdutoData,
  type ListProdutosQueryData,
  type UpdateProdutoData,
} from "@repo/contracts";
import { ProdutoPersistenceMapper } from "../produto-persistence.mapper";

describe("ProdutoPersistenceMapper", () => {
  describe("toCreateInput", () => {
    it("converte todos os campos de criação para o formato do Prisma", () => {
      const produto: CreateProdutoData = {
        sku: "PRODUTO-001",
        nome: "Produto completo",
        descricao: "Descrição do produto",
        urlManual: "https://example.com/manual.pdf",
        status: StatusProduto.ATIVO,
        emDestaque: false,
        estoque: 15,
        preco: "1234.50",
        pesoKg: 2.5,
        dataValidade: "2028-02-29",
        disponivelEm: "2026-09-05T10:00:00-03:00",
      };

      const resultado = ProdutoPersistenceMapper.toCreateInput(produto);

      expect(resultado).toEqual({
        sku: "PRODUTO-001",
        nome: "Produto completo",
        descricao: "Descrição do produto",
        urlManual: "https://example.com/manual.pdf",
        status: StatusProduto.ATIVO,
        emDestaque: false,
        estoque: 15,
        preco: "1234.50",
        pesoKg: 2.5,
        dataValidade: new Date("2028-02-29T00:00:00.000Z"),
        disponivelEm: new Date("2026-09-05T10:00:00-03:00"),
      });
    });

    it("não adiciona campos opcionais ausentes", () => {
      const produto: CreateProdutoData = {
        sku: "PRODUTO-002",
        nome: "Produto mínimo",
        status: StatusProduto.RASCUNHO,
        emDestaque: true,
        estoque: 0,
        preco: "10.00",
      };

      const resultado = ProdutoPersistenceMapper.toCreateInput(produto);

      expect(resultado).toEqual({
        sku: "PRODUTO-002",
        nome: "Produto mínimo",
        status: StatusProduto.RASCUNHO,
        emDestaque: true,
        estoque: 0,
        preco: "10.00",
      });

      expect(resultado).not.toHaveProperty("descricao");
      expect(resultado).not.toHaveProperty("urlManual");
      expect(resultado).not.toHaveProperty("pesoKg");
      expect(resultado).not.toHaveProperty("dataValidade");
      expect(resultado).not.toHaveProperty("disponivelEm");
    });
  });

  describe("toUpdateInput", () => {
    it("preserva null para limpar campos anuláveis", () => {
      const produto: UpdateProdutoData = {
        descricao: null,
        urlManual: null,
        pesoKg: null,
        dataValidade: null,
        disponivelEm: null,
      };

      const resultado = ProdutoPersistenceMapper.toUpdateInput(produto);

      expect(resultado).toEqual({
        descricao: null,
        urlManual: null,
        pesoKg: null,
        dataValidade: null,
        disponivelEm: null,
      });
    });

    it("converte datas presentes e omite propriedades ausentes", () => {
      const produto: UpdateProdutoData = {
        nome: "Nome atualizado",
        dataValidade: "2027-09-05",
        disponivelEm: "2027-09-05T12:30:00Z",
      };

      const resultado = ProdutoPersistenceMapper.toUpdateInput(produto);

      expect(resultado).toEqual({
        nome: "Nome atualizado",
        dataValidade: new Date("2027-09-05T00:00:00.000Z"),
        disponivelEm: new Date("2027-09-05T12:30:00Z"),
      });

      expect(resultado).not.toHaveProperty("sku");
      expect(resultado).not.toHaveProperty("descricao");
    });
  });

  describe("toWhere", () => {
    it("não cria filtros quando somente a paginação foi informada", () => {
      const query: ListProdutosQueryData = {
        pagina: 1,
        limite: 20,
      };

      expect(ProdutoPersistenceMapper.toWhere(query)).toEqual({});
    });

    it("cria filtros de status, destaque e pesquisa textual", () => {
      const query: ListProdutosQueryData = {
        pagina: 2,
        limite: 10,
        pesquisa: "produto",
        status: StatusProduto.ATIVO,
        emDestaque: false,
      };

      const resultado = ProdutoPersistenceMapper.toWhere(query);

      expect(resultado).toEqual({
        status: StatusProduto.ATIVO,
        emDestaque: false,
        OR: [
          {
            sku: {
              contains: "produto",
              mode: "insensitive",
            },
          },
          {
            nome: {
              contains: "produto",
              mode: "insensitive",
            },
          },
          {
            descricao: {
              contains: "produto",
              mode: "insensitive",
            },
          },
        ],
      });
    });
  });
});
