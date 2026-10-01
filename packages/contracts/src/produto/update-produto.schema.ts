import * as z from "zod";
import {
  DataValidadeProdutoSchema,
  DescricaoProdutoSchema,
  DisponivelEmProdutoSchema,
  EmDestaqueSchema,
  EstoqueProdutoSchema,
  NomeProdutoSchema,
  PesoKgProdutoSchema,
  PrecoProdutoSchema,
  SkuProdutoSchema,
  UrlManualProdutoSchema,
} from "./produto-fields.schema";
import { StatusProdutoSchema } from "./status-produto.schema";

export const UpdateProdutoSchema = z
  .strictObject({
    sku: SkuProdutoSchema.optional(),

    nome: NomeProdutoSchema.optional(),

    descricao: DescricaoProdutoSchema.nullable().optional(),

    urlManual: UrlManualProdutoSchema.nullable().optional(),

    status: StatusProdutoSchema.optional(),

    emDestaque: EmDestaqueSchema.optional(),

    estoque: EstoqueProdutoSchema.optional(),

    preco: PrecoProdutoSchema.optional(),

    pesoKg: PesoKgProdutoSchema.nullable().optional(),

    dataValidade: DataValidadeProdutoSchema.nullable().optional(),

    disponivelEm: DisponivelEmProdutoSchema.nullable().optional(),
  })
  .refine(
    (produto) => Object.values(produto).some((valor) => valor !== undefined),
    {
      error: "Informe ao menos um campo para a atualização.",
    },
  );

export type UpdateProdutoInput = z.input<typeof UpdateProdutoSchema>;
export type UpdateProdutoData = z.output<typeof UpdateProdutoSchema>;
