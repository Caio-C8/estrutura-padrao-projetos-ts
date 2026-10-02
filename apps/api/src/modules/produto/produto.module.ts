import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../common/database/database.module";
import { ProdutoController } from "./produto.controller";
import { ProdutoService } from "./produto.service";
import { ProdutoRepository } from "./produto.repository";
import { AvaliacaoProdutoController } from "./avaliacao-produto/avaliacao-produto.controller";
import { AvaliacaoProdutoService } from "./avaliacao-produto/avaliacao-produto.service";
import { AvaliacaoProdutoRepository } from "./avaliacao-produto/avaliacao-produto.repository";

@Module({
  imports: [DatabaseModule],
  controllers: [ProdutoController, AvaliacaoProdutoController],
  providers: [
    ProdutoService,
    ProdutoRepository,
    AvaliacaoProdutoService,
    AvaliacaoProdutoRepository,
  ],
})
export class ProdutoModule {}
