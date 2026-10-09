import * as z from "zod";
import {
  CreateAvaliacaoProdutoSchema,
  type CreateAvaliacaoProdutoInput,
} from "@repo/contracts";
import { AvaliacaoProdutoFormFieldsSchema } from "./avaliacao-produto-form-fields.schema";

function normalizarTextoOpcional(valor: string): string | undefined {
  const valorNormalizado = valor.trim();

  return valorNormalizado === "" ? undefined : valorNormalizado;
}

export const CreateAvaliacaoProdutoFormSchema =
  AvaliacaoProdutoFormFieldsSchema.transform(
    (valores): CreateAvaliacaoProdutoInput => {
      const comentario = normalizarTextoOpcional(valores.comentario);

      return {
        autorNome: valores.autorNome,
        nota: Number(valores.nota),
        recomenda: valores.recomenda,

        ...(comentario === undefined ? {} : { comentario }),
      };
    },
  ).pipe(CreateAvaliacaoProdutoSchema);

export type CreateAvaliacaoProdutoFormInput = z.input<
  typeof CreateAvaliacaoProdutoFormSchema
>;

export type CreateAvaliacaoProdutoFormData = z.output<
  typeof CreateAvaliacaoProdutoFormSchema
>;

export const CREATE_AVALIACAO_PRODUTO_FORM_DEFAULT_VALUES = {
  autorNome: "",
  nota: "",
  comentario: "",
  recomenda: true,
} satisfies CreateAvaliacaoProdutoFormInput;
