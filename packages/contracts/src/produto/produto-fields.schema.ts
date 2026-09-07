import * as z from "zod";

export const SkuProdutoSchema = z
  .string()
  .trim()
  .min(1, {
    error: "O SKU é obrigatório.",
  })
  .max(64, {
    error: "O SKU deve possuir no máximo 64 caracteres.",
  })
  .toUpperCase();

export const NomeProdutoSchema = z
  .string()
  .trim()
  .min(1, {
    error: "O nome é obrigatório.",
  })
  .max(64, {
    error: "O nome deve possuir no máximo 64 caracteres.",
  });

export const DescricaoProdutoSchema = z
  .string()
  .trim()
  .min(1, {
    error: "A descrição não pode ser vazia.",
  })
  .max(2_000, {
    error: "A descrição deve possuir no máximo 2.000 caracteres.",
  });

export const UrlManualProdutoSchema = z
  .url({
    error: "A URL do manual deve ser válida.",
  })
  .max(2_048, {
    error: "A URL do manual deve possuir no máximo 2.048 caracteres.",
  });

export const EstoqueProdutoSchema = z
  .number()
  .int({ error: "O estoque deve ser um número inteiro." })
  .min(0, {
    error: "O estoque não pode ser negativo.",
  });

export const PrecoProdutoSchema = z
  .string()
  .trim()
  .regex(/^(?:0|[1-9][0-9]{0,9})(?:\.[0-9]{1,2})?$/, {
    error:
      "O preço deve ser um decimal positivo com até 10 dígitos inteiros e 2 casas decimais.",
  });

export const PesoKgProdutoSchema = z.number().positive({
  error: "O peso deve ser maior que zero.",
});

export const DataValidadeProdutoSchema = z.iso.date({
  error: "A data de validade deve estar no formato YYYY-MM-DD.",
});

export const DisponivelEmProdutoSchema = z.iso.datetime({
  offset: true,
  error: "A data de disponibilidade deve estar no formato ISO 8601.",
});
