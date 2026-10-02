import { ListAvaliacoesProdutoResponseSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class ListAvaliacoesProdutoResponseDto extends createZodDto(
  ListAvaliacoesProdutoResponseSchema,
) {}
