import * as z from "zod";
import {
  UpdateAvaliacaoProdutoSchema,
  type UpdateAvaliacaoProdutoInput,
} from "@repo/contracts";
import { AvaliacaoProdutoFormFieldsSchema } from "./avaliacao-produto-form-fields.schema";

function normalizarTextoAnulavel(valor: string): string | null {
  const valorNormalizado = valor.trim();

  return valorNormalizado === "" ? null : valorNormalizado;
}

export const UpdateAvaliacaoProdutoFormSchema =
  AvaliacaoProdutoFormFieldsSchema.transform(
    (valores): UpdateAvaliacaoProdutoInput => ({
      autorNome: valores.autorNome,
      nota: Number(valores.nota),
      comentario: normalizarTextoAnulavel(valores.comentario),
      recomenda: valores.recomenda,
    }),
  ).pipe(UpdateAvaliacaoProdutoSchema);

export type UpdateAvaliacaoProdutoFormInput = z.input<
  typeof UpdateAvaliacaoProdutoFormSchema
>;

export type UpdateAvaliacaoProdutoFormData = z.output<
  typeof UpdateAvaliacaoProdutoFormSchema
>;
