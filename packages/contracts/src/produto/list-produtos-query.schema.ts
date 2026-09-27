import * as z from "zod";
import { StatusProdutoSchema } from "./status-produto.schema";
import { PaginacaoQuerySchema } from "../common";

const EmDestaqueQuerySchema = z.stringbool({
  truthy: ["true", "1"],
  falsy: ["false", "0"],
  case: "insensitive",
  error: "O filtro para 'em destaque' deve ser true, false, 1 ou 0.",
});

export const ListProdutosQuerySchema = PaginacaoQuerySchema.extend({
  pesquisa: z
    .string()
    .trim()
    .min(1, {
      error: "A pesquisa não pode ser vazia",
    })
    .max(100, {
      error: "A pesquisa deve possuir no máximo 100 caracteres.",
    })
    .optional(),

  status: StatusProdutoSchema.optional(),

  emDestaque: EmDestaqueQuerySchema.optional(),
});

export type ListProdutosQueryInput = z.input<typeof ListProdutosQuerySchema>;
export type ListProdutosQueryData = z.output<typeof ListProdutosQuerySchema>;
