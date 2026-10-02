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
import { AvaliacaoProdutoService } from "./avaliacao-produto.service";
import { ZodSerializerDto } from "nestjs-zod";
import {
  AvaliacaoProdutoParamsDto,
  AvaliacaoProdutoResponseDto,
  CreateAvaliacaoProdutoBodyDto,
  ListAvaliacoesProdutoQueryDto,
  ListAvaliacoesProdutoResponseDto,
  ProdutoAvaliacaoParamsDto,
  UpdateAvaliacaoProdutoBodyDto,
} from "./dtos";
import { AvaliacaoProdutoResponseMapper } from "./mappers/avaliacao-produto-response.mapper";
import type {
  AvaliacaoProdutoResponse,
  ListAvaliacoesProdutoResponse,
} from "@repo/contracts";

@Controller("produtos/:produtoId/avaliacoes")
export class AvaliacaoProdutoController {
  constructor(
    private readonly avaliacaoProdutoService: AvaliacaoProdutoService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ZodSerializerDto(AvaliacaoProdutoResponseDto)
  async create(
    @Param() params: ProdutoAvaliacaoParamsDto,
    @Body() body: CreateAvaliacaoProdutoBodyDto,
  ): Promise<AvaliacaoProdutoResponse> {
    const avaliacao = await this.avaliacaoProdutoService.create(
      params.produtoId,
      body,
    );

    return {
      status: HttpStatus.CREATED,
      sucesso: true,
      mensagem: "Avaliação criada com sucesso.",
      dados: AvaliacaoProdutoResponseMapper.toDetalhado(avaliacao),
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(ListAvaliacoesProdutoResponseDto)
  async list(
    @Param() params: ProdutoAvaliacaoParamsDto,
    @Query() query: ListAvaliacoesProdutoQueryDto,
  ): Promise<ListAvaliacoesProdutoResponse> {
    const resultado = await this.avaliacaoProdutoService.list(
      params.produtoId,
      query,
    );

    return {
      status: HttpStatus.OK,
      sucesso: true,
      mensagem: "Avaliações listadas com sucesso.",
      dados: resultado.items.map((avaliacao) =>
        AvaliacaoProdutoResponseMapper.toResumo(avaliacao),
      ),
      meta: {
        total: resultado.total,
        pagina: resultado.page,
        ultimaPagina: resultado.lastPage,
        limite: resultado.limit,
      },
    };
  }

  @Get(":avaliacaoId")
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(AvaliacaoProdutoResponseDto)
  async findById(
    @Param() params: AvaliacaoProdutoParamsDto,
  ): Promise<AvaliacaoProdutoResponse> {
    const avaliacao = await this.avaliacaoProdutoService.findById(
      params.produtoId,
      params.avaliacaoId,
    );

    return {
      status: HttpStatus.OK,
      sucesso: true,
      mensagem: "Avaliação encontrada com sucesso.",
      dados: AvaliacaoProdutoResponseMapper.toDetalhado(avaliacao),
    };
  }

  @Patch(":avaliacaoId")
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(AvaliacaoProdutoResponseDto)
  async updateById(
    @Param() params: AvaliacaoProdutoParamsDto,
    @Body() body: UpdateAvaliacaoProdutoBodyDto,
  ): Promise<AvaliacaoProdutoResponse> {
    const avaliacao = await this.avaliacaoProdutoService.updateById(
      params.produtoId,
      params.avaliacaoId,
      body,
    );

    return {
      status: HttpStatus.OK,
      sucesso: true,
      mensagem: "Avaliação atualizada com sucesso.",
      dados: AvaliacaoProdutoResponseMapper.toDetalhado(avaliacao),
    };
  }

  @Delete(":avaliacaoId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param() params: AvaliacaoProdutoParamsDto): Promise<void> {
    await this.avaliacaoProdutoService.deleteById(
      params.produtoId,
      params.avaliacaoId,
    );
  }
}
