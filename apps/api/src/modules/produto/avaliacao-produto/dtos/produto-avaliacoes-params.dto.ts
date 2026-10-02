import { ProdutoAvaliacoesParamsSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class ProdutoAvaliacaoParamsDto extends createZodDto(
  ProdutoAvaliacoesParamsSchema,
) {}
