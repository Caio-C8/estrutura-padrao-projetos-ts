import * as z from "zod";
import {
  criarRespostaSucessoPaginadaSchema,
  criarRespostaSucessoSchema,
} from "../common";
import { NotaAvaliacaoProdutoSchema } from "./avaliacao-produto-fields.schema";

const DateTimeUtcResponseSchema = z.iso.datetime({
  precision: 3,
  error: "A data da resposta deve estar em UTC com precisão de milissegundos.",
});

export const AvaliacaoProdutoDetalhadoResponseSchema = z.strictObject({
  id: z.uuid(),
  produtoId: z.uuid(),
  autorNome: z.string().min(1).max(80),
  nota: NotaAvaliacaoProdutoSchema,
  comentario: z.string().min(1).max(1_000).nullable(),
  recomenda: z.boolean(),
  createdAt: DateTimeUtcResponseSchema,
  updatedAt: DateTimeUtcResponseSchema,
});

export const AvaliacaoProdutoResumoResponseSchema =
  AvaliacaoProdutoDetalhadoResponseSchema.pick({
    id: true,
    produtoId: true,
    autorNome: true,
    nota: true,
    createdAt: true,
  });

export const AvaliacaoProdutoResponseSchema = criarRespostaSucessoSchema(
  AvaliacaoProdutoDetalhadoResponseSchema,
);

export const ListAvaliacoesProdutoResponseSchema =
  criarRespostaSucessoPaginadaSchema(AvaliacaoProdutoResumoResponseSchema);

export type AvaliacaoProdutoDetalhadoResponse = z.output<
  typeof AvaliacaoProdutoDetalhadoResponseSchema
>;

export type AvaliacaoProdutoResumoResponse = z.output<
  typeof AvaliacaoProdutoResumoResponseSchema
>;

export type AvaliacaoProdutoResponse = z.output<
  typeof AvaliacaoProdutoResponseSchema
>;

export type ListAvaliacoesProdutoResponse = z.output<
  typeof ListAvaliacoesProdutoResponseSchema
>;
