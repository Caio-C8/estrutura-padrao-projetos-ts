import * as z from "zod";
import { StatusProduto, StatusProdutoSchema } from "./status-produto.schema";
import {
  DataValidadeProdutoSchema,
  DescricaoProdutoSchema,
  DisponivelEmProdutoSchema,
  EstoqueProdutoSchema,
  NomeProdutoSchema,
  PesoKgProdutoSchema,
  PrecoProdutoSchema,
  SkuProdutoSchema,
  UrlManualProdutoSchema,
} from "./produto-fields.schema";

export const CreateProdutoSchema = z.strictObject({
  sku: SkuProdutoSchema,

  nome: NomeProdutoSchema,

  descricao: DescricaoProdutoSchema.optional(),

  urlManual: UrlManualProdutoSchema.optional(),

  status: StatusProdutoSchema.default(StatusProduto.RASCUNHO),

  emDestaque: z.boolean().default(true),

  estoque: EstoqueProdutoSchema.default(0),

  preco: PrecoProdutoSchema,

  pesoKg: PesoKgProdutoSchema.optional(),

  dataValidade: DataValidadeProdutoSchema.optional(),

  disponivelEm: DisponivelEmProdutoSchema.optional(),
});

export type CreateProdutoInput = z.input<typeof CreateProdutoSchema>;
export type CreateProdutoData = z.output<typeof CreateProdutoSchema>;
