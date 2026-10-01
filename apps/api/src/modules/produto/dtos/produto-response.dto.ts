import { ProdutoResponseSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class ProdutoResponseDto extends createZodDto(ProdutoResponseSchema) {}
