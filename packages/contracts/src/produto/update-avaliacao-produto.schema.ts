import * as z from "zod";
import {
  AutorNomeAvaliacaoProdutoSchema,
  ComentarioAvaliacaoProdutoSchema,
  NotaAvaliacaoProdutoSchema,
} from "./avaliacao-produto-fields.schema";

export const UpdateAvaliacaoProdutoSchema = z
  .strictObject({
    autorNome: AutorNomeAvaliacaoProdutoSchema.optional(),

    nota: NotaAvaliacaoProdutoSchema.optional(),

    comentario: ComentarioAvaliacaoProdutoSchema.nullable().optional(),

    recomenda: z.boolean().optional(),
  })
  .refine(
    (avaliacao) =>
      Object.values(avaliacao).some((valor) => valor !== undefined),
    {
      error: "Informe ao menos um campo para a atualização.",
    },
  );

export type UpdateAvaliacaoProdutoInput = z.input<
  typeof UpdateAvaliacaoProdutoSchema
>;
export type UpdateAvaliacaoProdutoData = z.output<
  typeof UpdateAvaliacaoProdutoSchema
>;
