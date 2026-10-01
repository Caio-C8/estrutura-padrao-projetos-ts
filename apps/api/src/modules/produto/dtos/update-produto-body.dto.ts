import { UpdateProdutoSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class UpdateProdutoBodyDto extends createZodDto(UpdateProdutoSchema) {}
