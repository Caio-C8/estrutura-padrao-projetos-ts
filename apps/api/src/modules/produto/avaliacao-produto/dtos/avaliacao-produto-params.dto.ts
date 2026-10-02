import { AvaliacaoProdutoParamsSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class AvaliacaoProdutoParamsDto extends createZodDto(
  AvaliacaoProdutoParamsSchema,
) {}
