import type {
  AvaliacaoProdutoDetalhadoResponse,
  AvaliacaoProdutoResumoResponse,
} from "@repo/contracts";
import type {
  AvaliacaoProdutoDetalhadoPayload,
  AvaliacaoProdutoResumoPayload,
} from "../types/avaliacao-produto.types";

function formatarDataHoraUtc(data: Date): string {
  return data.toISOString();
}

export class AvaliacaoProdutoResponseMapper {
  static toResumo(
    avaliacao: AvaliacaoProdutoResumoPayload,
  ): AvaliacaoProdutoResumoResponse {
    return {
      id: avaliacao.id,
      produtoId: avaliacao.produtoId,
      autorNome: avaliacao.autorNome,
      nota: avaliacao.nota,
      createdAt: formatarDataHoraUtc(avaliacao.createdAt),
    };
  }

  static toDetalhado(
    avaliacao: AvaliacaoProdutoDetalhadoPayload,
  ): AvaliacaoProdutoDetalhadoResponse {
    return {
      ...this.toResumo(avaliacao),
      comentario: avaliacao.comentario ?? null,
      recomenda: avaliacao.recomenda,
      updatedAt: formatarDataHoraUtc(avaliacao.updatedAt),
    };
  }
}
