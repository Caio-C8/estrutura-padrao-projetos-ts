import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ProdutoService } from "./produto.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  CreateProdutoBodyDto,
  ListProdutosQueryDto,
  ListProdutosResponseDto,
  ProdutoParamsDto,
  ProdutoResponseDto,
  UpdateProdutoBodyDto,
} from "./dtos";
import type { ListProdutosResponse, ProdutoResponse } from "@repo/contracts";
import { ProdutoResponseMapper } from "./mappers/produto-response.mapper";

@Controller("produtos")
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(ProdutoResponseDto)
  async create(@Body() body: CreateProdutoBodyDto): Promise<ProdutoResponse> {
    const produto = await this.produtoService.create(body);

    return {
      status: HttpStatus.CREATED,
      sucesso: true,
      mensagem: "Produto criado com sucesso.",
      dados: ProdutoResponseMapper.toDetalhado(produto),
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ListProdutosResponseDto)
  async list(
    @Query() query: ListProdutosQueryDto,
  ): Promise<ListProdutosResponse> {
    const resultado = await this.produtoService.list(query);

    return {
      status: HttpStatus.OK,
      sucesso: true,
      mensagem: "Produtos listados com sucesso.",
      dados: resultado.items.map((produto) =>
        ProdutoResponseMapper.toResumo(produto),
      ),
      meta: {
        total: resultado.total,
        pagina: resultado.page,
        ultimaPagina: resultado.lastPage,
        limite: resultado.limit,
      },
    };
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ProdutoResponseDto)
  async findById(@Param() params: ProdutoParamsDto): Promise<ProdutoResponse> {
    const produto = await this.produtoService.findById(params.id);

    return {
      status: HttpStatus.OK,
      sucesso: true,
      mensagem: "Produto encontrado com sucesso.",
      dados: ProdutoResponseMapper.toDetalhado(produto),
    };
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ProdutoResponseDto)
  async updateById(
    @Param() params: ProdutoParamsDto,
    @Body() body: UpdateProdutoBodyDto,
  ): Promise<ProdutoResponse> {
    const produto = await this.produtoService.updateById(params.id, body);

    return {
      status: HttpStatus.OK,
      sucesso: true,
      mensagem: "Produto atualizado com sucesso.",
      dados: ProdutoResponseMapper.toDetalhado(produto),
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param() params: ProdutoParamsDto): Promise<void> {
    await this.produtoService.deleteById(params.id);
  }
}
