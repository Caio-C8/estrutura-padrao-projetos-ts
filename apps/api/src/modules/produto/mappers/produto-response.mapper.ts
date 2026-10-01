import type {
  ProdutoDetalhadoResponse,
  ProdutoResumoResponse,
} from "@repo/contracts";
import type {
  ProdutoDetalhadoPayload,
  ProdutoResumoPayload,
} from "../types/produto.types";

function formatarDataDeCalendario(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export class ProdutoResponseMapper {
  static toResumo(produto: ProdutoResumoPayload): ProdutoResumoResponse {
    return {
      id: produto.id,
      sku: produto.sku,
      nome: produto.nome,
      status: produto.status,
      emDestaque: produto.emDestaque,
      estoque: produto.estoque,
      preco: produto.preco.toFixed(2),
      pesoKg: produto.pesoKg,
      quantidadeVendas: produto.quantidadeVendas.toString(),
      dataValidade:
        produto.dataValidade === null
          ? null
          : formatarDataDeCalendario(produto.dataValidade),
      disponivelEm: produto.disponivelEm?.toISOString() ?? null,
      createdAt: produto.createdAt.toISOString(),
      updatedAt: produto.updatedAt.toISOString(),
    };
  }

  static toDetalhado(
    produto: ProdutoDetalhadoPayload,
  ): ProdutoDetalhadoResponse {
    return {
      ...this.toResumo(produto),
      descricao: produto.descricao,
      urlManual: produto.urlManual,
    };
  }
}
