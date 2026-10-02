import { ListAvaliacoesProdutoQuerySchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class ListAvaliacoesProdutoQueryDto extends createZodDto(
  ListAvaliacoesProdutoQuerySchema,
) {}
