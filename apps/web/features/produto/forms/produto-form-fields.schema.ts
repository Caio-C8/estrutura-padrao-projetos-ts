import * as z from "zod";
import { StatusProdutoSchema } from "@repo/contracts";

export const ProdutoFormFieldsSchema = z.strictObject({
  sku: z.string(),
  nome: z.string(),
  descricao: z.string(),
  urlManual: z.string(),
  status: StatusProdutoSchema,
  emDestaque: z.boolean(),
  estoque: z.string(),
  preco: z.string(),
  pesoKg: z.string(),
  dataValidade: z.string(),
  disponivelEm: z.string(),
});

export type ProdutoFormFieldsInput = z.input<typeof ProdutoFormFieldsSchema>;
