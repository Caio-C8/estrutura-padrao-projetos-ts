import * as z from "zod";
import { StatusProdutoSchema } from "./status-produto.schema";
import {
  criarRespostaSucessoPaginadaSchema,
  criarRespostaSucessoSchema,
} from "../common";

const PrecoProdutoResponseSchema = z
  .string()
  .regex(/^(?:0|[1-9][0-9]{0,9})\.[0-9]{2}$/, {
    error: "O preço da resposta deve possuir exatamente duas casas decimais.",
  });

const QuantidadeVendasResponseSchema = z
  .string()
  .regex(/^(?:0|[1-9][0-9]*)$/, {
    error: "A quantidade de vendas deve ser uma string inteira não negativa.",
  })
  .max(19);

const DateTimeUtcResponseSchema = z.iso.datetime({
  precision: 3,
  error: "A data da resposta deve estar em UTC com precisão de milissegundos.",
});

export const ProdutoDetalhadoResponseSchema = z.strictObject({
  id: z.uuid(),
  sku: z.string().min(1).max(64).uppercase(),
  nome: z.string().min(1).max(64),
  descricao: z.string().min(1).max(2_000).nullable(),
  urlManual: z.url().max(2_048).nullable(),
  status: StatusProdutoSchema,
  emDestaque: z.boolean(),
  estoque: z.number().int().min(0),
  preco: PrecoProdutoResponseSchema,
  pesoKg: z.number().positive().nullable(),
  quantidadeVendas: QuantidadeVendasResponseSchema,
  dataValidade: z.iso.date().nullable(),
  disponivelEm: DateTimeUtcResponseSchema.nullable(),
  createdAt: DateTimeUtcResponseSchema,
  updatedAt: DateTimeUtcResponseSchema,
});

export const ProdutoResumoResponseSchema = ProdutoDetalhadoResponseSchema.pick({
  id: true,
  sku: true,
  nome: true,
  status: true,
  emDestaque: true,
  estoque: true,
  preco: true,
  pesoKg: true,
  quantidadeVendas: true,
  dataValidade: true,
  disponivelEm: true,
  createdAt: true,
  updatedAt: true,
});

export const ProdutoResponseSchema = criarRespostaSucessoSchema(
  ProdutoDetalhadoResponseSchema,
);

export const ListProdutosResponseSchema = criarRespostaSucessoPaginadaSchema(
  ProdutoResumoResponseSchema,
);

export type ProdutoDetalhadoResponse = z.output<
  typeof ProdutoDetalhadoResponseSchema
>;
export type ProdutoResumoResponse = z.output<
  typeof ProdutoResumoResponseSchema
>;
export type ProdutoResponse = z.output<typeof ProdutoResponseSchema>;
export type ListProdutosResponse = z.output<typeof ListProdutosResponseSchema>;
