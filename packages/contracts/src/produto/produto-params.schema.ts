import * as z from "zod";

export const ProdutoParamsSchema = z.strictObject({
  id: z.uuid({
    error: "O ID do produto deve ser um UUID válido.",
  }),
});

export type ProdutoParamsInput = z.input<typeof ProdutoParamsSchema>;
export type ProdutoParamsData = z.output<typeof ProdutoParamsSchema>;
