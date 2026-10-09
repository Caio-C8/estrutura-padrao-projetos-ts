import {
  UpdateAvaliacaoProdutoSchema,
  type AvaliacaoProdutoDetalhadoResponse,
  type UpdateAvaliacaoProdutoData,
} from "@repo/contracts";
import type {
  UpdateAvaliacaoProdutoFormData,
  UpdateAvaliacaoProdutoFormInput,
} from "./update-avaliacao-produto-form.schema";

export type UpdateAvaliacaoProdutoDirtyFields = Readonly<
  Partial<Record<keyof UpdateAvaliacaoProdutoFormInput, boolean>>
>;

export function criarUpdateAvaliacaoProdutoFormDefaultValues(
  avaliacao: AvaliacaoProdutoDetalhadoResponse,
): UpdateAvaliacaoProdutoFormInput {
  return {
    autorNome: avaliacao.autorNome,
    nota: String(avaliacao.nota),
    comentario: avaliacao.comentario ?? "",
    recomenda: avaliacao.recomenda,
  };
}

export function criarUpdateAvaliacaoProdutoBody(
  valores: UpdateAvaliacaoProdutoFormData,
  camposAlterados: UpdateAvaliacaoProdutoDirtyFields,
): UpdateAvaliacaoProdutoData {
  return UpdateAvaliacaoProdutoSchema.parse({
    ...(camposAlterados.autorNome ? { autorNome: valores.autorNome } : {}),
    ...(camposAlterados.nota ? { nota: valores.nota } : {}),
    ...(camposAlterados.comentario ? { comentario: valores.comentario } : {}),
    ...(camposAlterados.recomenda ? { recomenda: valores.recomenda } : {}),
  });
}
