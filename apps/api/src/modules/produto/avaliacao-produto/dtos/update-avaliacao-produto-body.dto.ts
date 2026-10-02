import { UpdateAvaliacaoProdutoSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class UpdateAvaliacaoProdutoBodyDto extends createZodDto(
  UpdateAvaliacaoProdutoSchema,
) {}
