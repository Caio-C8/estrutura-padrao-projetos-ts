import * as z from "zod";
import {
  AutorNomeAvaliacaoProdutoSchema,
  ComentarioAvaliacaoProdutoSchema,
  NotaAvaliacaoProdutoSchema,
  RecomendaAvaliacaoProdutoSchema,
} from "./avaliacao-produto-fields.schema";

export const CreateAvaliacaoProdutoSchema = z.strictObject({
  autorNome: AutorNomeAvaliacaoProdutoSchema,

  nota: NotaAvaliacaoProdutoSchema,

  comentario: ComentarioAvaliacaoProdutoSchema.optional(),

  recomenda: RecomendaAvaliacaoProdutoSchema.default(true),
});

export type CreateAvaliacaoProdutoInput = z.input<
  typeof CreateAvaliacaoProdutoSchema
>;
export type CreateAvaliacaoProdutoData = z.output<
  typeof CreateAvaliacaoProdutoSchema
>;
