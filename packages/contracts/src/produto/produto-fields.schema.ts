import * as z from "zod";

export const SkuProdutoSchema = z
  .string({
    error: "Informe um SKU válido.",
  })
  .trim()
  .min(1, {
    error: "O SKU é obrigatório.",
  })
  .max(64, {
    error: "O SKU deve possuir no máximo 64 caracteres.",
  })
  .toUpperCase();

export const NomeProdutoSchema = z
  .string({
    error: "Informe um nome válido.",
  })
  .trim()
  .min(1, {
    error: "O nome é obrigatório.",
  })
  .max(64, {
    error: "O nome deve possuir no máximo 64 caracteres.",
  });

export const DescricaoProdutoSchema = z
  .string({
    error: "Informe uma descrição válida.",
  })
  .trim()
  .min(1, {
    error: "A descrição não pode ser vazia.",
  })
  .max(2_000, {
    error: "A descrição deve possuir no máximo 2.000 caracteres.",
  });

export const UrlManualProdutoSchema = z
  .url({
    protocol: /^https?$/,
    error: "A URL do manual deve ser uma URL HTTP ou HTTPS válida.",
  })
  .max(2_048, {
    error: "A URL do manual deve possuir no máximo 2.048 caracteres.",
  });

export const EmDestaqueSchema = z.boolean({
  error: "Selecione se o produto deve ficar em destaque.",
});

export const EstoqueProdutoSchema = z
  .number({
    error: "Informe um estoque válido usando um número inteiro.",
  })
  .int({ error: "O estoque deve ser um número inteiro." })
  .min(0, {
    error: "O estoque não pode ser negativo.",
  });

export const PrecoProdutoSchema = z
  .string({
    error: "Informe um preço válido com no máximo duas casas decimais.",
  })
  .trim()
  .regex(/^(?:0|[1-9][0-9]{0,9})(?:\.[0-9]{1,2})?$/, {
    error:
      "O preço deve ser um decimal positivo com até 10 dígitos inteiros e 2 casas decimais.",
  })
  .refine((preco) => preco !== "0" && preco !== "0.0" && preco !== "0.00", {
    error: "O preço deve ser maior ou igual a 0.01.",
  });

export const PesoKgProdutoSchema = z
  .number({
    error: "Informe um peso válido usando um número maior que zero.",
  })
  .positive({
    error: "O peso deve ser maior que zero.",
  });

export const DataValidadeProdutoSchema = z.iso.date({
  error: "A data de validade deve estar em um formato válido.",
});

export const DisponivelEmProdutoSchema = z.iso.datetime({
  offset: true,
  error: "A data de disponibilidade deve estar em um formato válido.",
});
