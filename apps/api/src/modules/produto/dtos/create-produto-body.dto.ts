import { CreateProdutoSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class CreateProdutoBodyDto extends createZodDto(CreateProdutoSchema) {}
