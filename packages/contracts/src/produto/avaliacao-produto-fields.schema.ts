import * as z from "zod";

export const AutorNomeAvaliacaoProdutoSchema = z
  .string()
  .trim()
  .min(1, {
    error: "O nome do autor é obrigatório.",
  })
  .max(80, {
    error: "O nome do autor deve possuir no máximo 80 caracteres.",
  });

export const NotaAvaliacaoProdutoSchema = z
  .number()
  .int({ error: "A nota deve ser um número inteiro." })
  .min(1, { error: "A nota deve ser no mínimo 1." })
  .max(5, {
    error: "A nota deve ser no máximo 5.",
  });

export const ComentarioAvaliacaoProdutoSchema = z
  .string()
  .trim()
  .min(1, {
    error: "O comentário deve ter no mínimo 1 caractere.",
  })
  .max(1_000, { error: "O comentário deve ter no máximo 1000 caracteres." });
