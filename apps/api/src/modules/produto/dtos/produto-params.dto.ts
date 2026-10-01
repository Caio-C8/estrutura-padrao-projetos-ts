import { ProdutoParamsSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class ProdutoParamsDto extends createZodDto(ProdutoParamsSchema) {}
