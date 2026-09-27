import * as z from "zod";

export const ProdutoAvaliacoesParamsSchema = z.strictObject({
  produtoId: z.uuid({
    error: "O ID do produto deve ser um UUID válido.",
  }),
});

export const AvaliacaoProdutoParamsSchema = z.strictObject({
  avaliacaoId: z.uuid({
    error: "O ID da avaliação deve ser um UUID válido.",
  }),

  produtoId: z.uuid({
    error: "O ID do produto deve ser um UUID válido.",
  }),
});

export type ProdutoAvaliacoesParamsInput = z.input<
  typeof ProdutoAvaliacoesParamsSchema
>;
export type ProdutoAvaliacoesParamsData = z.output<
  typeof ProdutoAvaliacoesParamsSchema
>;

export type AvaliacaoProdutoParamsInput = z.input<
  typeof AvaliacaoProdutoParamsSchema
>;
export type AvaliacaoProdutoParamsData = z.output<
  typeof AvaliacaoProdutoParamsSchema
>;
