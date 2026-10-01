import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { ProdutoController } from "./produto.controller";
import { ProdutoService } from "./produto.service";
import { ProdutoRepository } from "./produto.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [ProdutoController],
  providers: [ProdutoService, ProdutoRepository],
})
export class ProdutoModule {}
