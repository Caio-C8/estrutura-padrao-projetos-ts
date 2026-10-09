import * as z from "zod";

export const AvaliacaoProdutoFormFieldsSchema = z.strictObject({
  autorNome: z
    .string({
      error: "Informe um nome válido.",
    })
    .trim()
    .min(1, {
      error: "O nome do autor é obrigatório.",
    })
    .max(80, {
      error: "O nome do autor deve possuir no máximo 80 caracteres.",
    }),

  nota: z
    .string({
      error: "Selecione uma nota válida.",
    })
    .regex(/^[1-5]$/, {
      error: "Selecione uma nota entre 1 e 5.",
    }),

  comentario: z
    .string({
      error: "Informe um comentário válido.",
    })
    .trim()
    .max(1_000, {
      error: "O comentário deve ter no máximo 1000 caracteres.",
    }),

  recomenda: z.boolean({
    error: "Selecione se você recomenda este produto.",
  }),
});

export type AvaliacaoProdutoFormFieldsInput = z.input<
  typeof AvaliacaoProdutoFormFieldsSchema
>;
