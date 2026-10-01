import { ListProdutosResponseSchema } from "@repo/contracts";
import { createZodDto } from "nestjs-zod";

export class ListProdutosResponseDto extends createZodDto(
  ListProdutosResponseSchema,
) {}
