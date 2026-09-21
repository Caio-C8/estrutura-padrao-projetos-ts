import * as z from "zod";
import { StatusProdutoSchema } from "./status-produto.schema";

const PaginaQuerySchema = z
  .string({
    error: "A página deve ser informada como um número inteiro.",
  })
  .regex(/^[0-9]+$/, {
    error: "A página deve conter somente dígitos.",
  })
  .transform((valor) => Number(valor))
  .pipe(
    z
      .number()
      .int({
        error: "A página deve ser um número inteiro.",
      })
      .min(1, {
        error: "A página deve ser maior ou igual a 1.",
      }),
  );

const LimiteQuerySchema = z
  .string({
    error: "O limite deve ser informado como um número inteiro.",
  })
  .regex(/^[0-9]+$/, {
    error: "O limite deve conter somente dígitos.",
  })
  .transform((valor) => Number(valor))
  .pipe(
    z
      .number()
      .int({
        error: "O limite deve ser um número inteiro.",
      })
      .min(1, {
        error: "O limite deve ser um número maior ou igual a 1.",
      })
      .max(50, {
        error: "O limite deve ser um número menor ou igual a 50.",
      }),
  );

const EmDestaqueQuerySchema = z.stringbool({
  truthy: ["true", "1"],
  falsy: ["false", "0"],
  case: "insensitive",
  error: "O filtro para 'em destaque' deve ser true, false, 1 ou 0.",
});

export const ListProdutosQuerySchema = z.strictObject({
  pagina: PaginaQuerySchema.default(1),

  limite: LimiteQuerySchema.default(20),

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
