import {
  ProdutoDetalhadoResponseSchema,
  ProdutoResumoResponseSchema,
  StatusProduto,
} from "@repo/contracts";
import { Prisma } from "@repo/database";
import type {
  ProdutoDetalhadoPayload,
  ProdutoResumoPayload,
} from "../../types/produto.types";
import { ProdutoResponseMapper } from "../produto-response.mapper";

const PRODUTO_ID = "875035dc-7f98-4096-b062-11b72d07c427";

function criarProdutoResumo(
  alteracoes: Partial<ProdutoResumoPayload> = {},
): ProdutoResumoPayload {
  return {
    id: PRODUTO_ID,
    sku: "PRODUTO-001",
    nome: "Produto de teste",
    status: StatusProduto.ATIVO,
    emDestaque: true,
    estoque: 15,
    preco: new Prisma.Decimal("1234.5"),
    pesoKg: 2.5,
    quantidadeVendas: 9_007_199_254_740_993n,
    dataValidade: new Date("2028-02-29T00:00:00.000Z"),
    disponivelEm: new Date("2026-09-05T13:00:00.000Z"),
    createdAt: new Date("2026-09-01T10:20:30.123Z"),
    updatedAt: new Date("2026-09-02T11:21:31.456Z"),
    ...alteracoes,
  };
}

describe("ProdutoResponseMapper", () => {
  describe("toResumo", () => {
    it("converte Decimal, BigInt e datas para representações JSON", () => {
      const resultado = ProdutoResponseMapper.toResumo(criarProdutoResumo());

      expect(resultado).toEqual({
        id: PRODUTO_ID,
        sku: "PRODUTO-001",
        nome: "Produto de teste",
        status: StatusProduto.ATIVO,
        emDestaque: true,
        estoque: 15,
        preco: "1234.50",
        pesoKg: 2.5,
        quantidadeVendas: "9007199254740993",
        dataValidade: "2028-02-29",
        disponivelEm: "2026-09-05T13:00:00.000Z",
        createdAt: "2026-09-01T10:20:30.123Z",
        updatedAt: "2026-09-02T11:21:31.456Z",
      });

      expect(ProdutoResumoResponseSchema.parse(resultado)).toEqual(resultado);
    });

    it("preserva campos anuláveis como null", () => {
      const produto = criarProdutoResumo({
        pesoKg: null,
        dataValidade: null,
        disponivelEm: null,
      });

      const resultado = ProdutoResponseMapper.toResumo(produto);

      expect(resultado).toMatchObject({
        pesoKg: null,
        dataValidade: null,
        disponivelEm: null,
      });

      expect(ProdutoResumoResponseSchema.parse(resultado)).toEqual(resultado);
    });
  });

  describe("toDetalhado", () => {
    it("adiciona descrição e URL do manual à resposta resumida", () => {
      const produto: ProdutoDetalhadoPayload = {
        ...criarProdutoResumo(),
        descricao: "Descrição detalhada",
        urlManual: "https://example.com/manual.pdf",
      };

      const resumo = ProdutoResponseMapper.toResumo(produto);
      const resultado = ProdutoResponseMapper.toDetalhado(produto);

      expect(resultado).toEqual({
        ...resumo,
        descricao: "Descrição detalhada",
        urlManual: "https://example.com/manual.pdf",
      });

      expect(ProdutoDetalhadoResponseSchema.parse(resultado)).toEqual(
        resultado,
      );
    });

    it("preserva descrição e URL anuláveis", () => {
      const produto: ProdutoDetalhadoPayload = {
        ...criarProdutoResumo(),
        descricao: null,
        urlManual: null,
      };

      const resultado = ProdutoResponseMapper.toDetalhado(produto);

      expect(resultado.descricao).toBeNull();
      expect(resultado.urlManual).toBeNull();

      expect(ProdutoDetalhadoResponseSchema.parse(resultado)).toEqual(
        resultado,
      );
    });
  });
});
