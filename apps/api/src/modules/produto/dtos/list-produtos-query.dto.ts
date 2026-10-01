import { ListProdutosQuerySchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class ListProdutosQueryDto extends createZodDto(
  ListProdutosQuerySchema,
) {}
