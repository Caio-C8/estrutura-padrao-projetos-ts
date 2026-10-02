import * as z from "zod";

export const AutorNomeAvaliacaoProdutoSchema = z
  .string({ error: "Informe um nome válido." })
  .trim()
  .min(1, {
    error: "O nome do autor é obrigatório.",
  })
  .max(80, {
    error: "O nome do autor deve possuir no máximo 80 caracteres.",
  });

export const NotaAvaliacaoProdutoSchema = z
  .number({
    error: "Informe uma nota válida usando um número inteiro entre 1 e 5.",
  })
  .int({ error: "A nota deve ser um número inteiro." })
  .min(1, { error: "A nota deve ser no mínimo 1." })
  .max(5, {
    error: "A nota deve ser no máximo 5.",
  });

export const ComentarioAvaliacaoProdutoSchema = z
  .string({
    error: "Informe um comentário que tenha um formato válido.",
  })
  .trim()
  .min(1, {
    error: "O comentário deve ter no mínimo 1 caractere.",
  })
  .max(1_000, { error: "O comentário deve ter no máximo 1000 caracteres." });

export const RecomendaAvaliacaoProdutoSchema = z.boolean({
  error: "Selecione se você recomenda este produto.",
});
