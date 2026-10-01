import * as z from "zod";

export const StatusProduto = {
  RASCUNHO: "RASCUNHO",
  ATIVO: "ATIVO",
  DESCONTINUADO: "DESCONTINUADO",
} as const;

export const StatusProdutoSchema = z.enum(StatusProduto, {
  error: "Selecione um status válido para o produto.",
});

export type StatusProdutoInput = z.input<typeof StatusProdutoSchema>;
export type StatusProdutoData = z.output<typeof StatusProdutoSchema>;
