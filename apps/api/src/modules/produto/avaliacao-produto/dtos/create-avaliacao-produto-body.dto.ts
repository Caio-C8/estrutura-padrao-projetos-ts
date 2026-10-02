import { CreateAvaliacaoProdutoSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class CreateAvaliacaoProdutoBodyDto extends createZodDto(
  CreateAvaliacaoProdutoSchema,
) {}
