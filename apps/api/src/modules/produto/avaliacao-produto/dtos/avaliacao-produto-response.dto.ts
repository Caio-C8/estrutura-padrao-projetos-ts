import { AvaliacaoProdutoResponseSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class AvaliacaoProdutoResponseDto extends createZodDto(
  AvaliacaoProdutoResponseSchema,
) {}
