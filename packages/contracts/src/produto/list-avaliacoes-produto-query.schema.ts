import * as z from "zod";
import { PaginacaoQuerySchema } from "../common";

const RecomendaQuerySchema = z.stringbool({
  truthy: ["true", "1"],
  falsy: ["false", "0"],
  case: "insensitive",
  error: "O filtro para 'recomenda' deve ser true, false, 1 ou 0.",
});

export const ListAvaliacoesProdutoQuerySchema = PaginacaoQuerySchema.extend({
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

  recomenda: RecomendaQuerySchema.optional(),
});

export type ListAvaliacoesProdutoQueryInput = z.input<
  typeof ListAvaliacoesProdutoQuerySchema
>;
export type ListAvaliacoesProdutoQueryData = z.output<
  typeof ListAvaliacoesProdutoQuerySchema
>;
