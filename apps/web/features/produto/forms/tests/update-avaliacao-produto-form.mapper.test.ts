import { describe, expect, it } from "vitest";
import type { AvaliacaoProdutoDetalhadoResponse } from "@repo/contracts";
import {
  criarUpdateAvaliacaoProdutoBody,
  criarUpdateAvaliacaoProdutoFormDefaultValues,
} from "../update-avaliacao-produto-form.mapper";
import { UpdateAvaliacaoProdutoFormSchema } from "../update-avaliacao-produto-form.schema";

const AVALIACAO = {
  id: "b48298c4-d9e5-4713-8e1b-983b6380fe43",
  produtoId: "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4",
  autorNome: "Maria",
  nota: 5,
  comentario: "Produto excelente.",
  recomenda: true,
  createdAt: "2026-10-08T10:00:00.000Z",
  updatedAt: "2026-10-08T10:00:00.000Z",
} satisfies AvaliacaoProdutoDetalhadoResponse;

describe("criarUpdateAvaliacaoProdutoFormDefaultValues", () => {
  it("converte o detalhe para os valores visuais do formulário", () => {
    const resultado = criarUpdateAvaliacaoProdutoFormDefaultValues(AVALIACAO);

    expect(resultado).toEqual({
      autorNome: "Maria",
      nota: "5",
      comentario: "Produto excelente.",
      recomenda: true,
    });
  });

  it("converte comentário null para campo vazio", () => {
    const resultado = criarUpdateAvaliacaoProdutoFormDefaultValues({
      ...AVALIACAO,
      comentario: null,
    });

    expect(resultado.comentario).toBe("");
  });
});

describe("criarUpdateAvaliacaoProdutoBody", () => {
  it("inclui somente os campos marcados como alterados", () => {
    const valores = UpdateAvaliacaoProdutoFormSchema.parse({
      ...criarUpdateAvaliacaoProdutoFormDefaultValues(AVALIACAO),
      autorNome: "Maria atualizada",
      nota: "4",
    });

    const resultado = criarUpdateAvaliacaoProdutoBody(valores, {
      autorNome: true,
      nota: true,
    });

    expect(resultado).toEqual({
      autorNome: "Maria atualizada",
      nota: 4,
    });
  });

  it("envia null quando o comentário é apagado", () => {
    const valores = UpdateAvaliacaoProdutoFormSchema.parse({
      ...criarUpdateAvaliacaoProdutoFormDefaultValues(AVALIACAO),
      comentario: "",
    });

    const resultado = criarUpdateAvaliacaoProdutoBody(valores, {
      comentario: true,
    });

    expect(resultado).toEqual({
      comentario: null,
    });
  });

  it("preserva false quando a recomendação é alterada", () => {
    const valores = UpdateAvaliacaoProdutoFormSchema.parse({
      ...criarUpdateAvaliacaoProdutoFormDefaultValues(AVALIACAO),
      recomenda: false,
    });

    const resultado = criarUpdateAvaliacaoProdutoBody(valores, {
      recomenda: true,
    });

    expect(resultado).toEqual({
      recomenda: false,
    });
  });

  it("não envia o comentário intacto mesmo quando ele é null", () => {
    const avaliacaoSemComentario = {
      ...AVALIACAO,
      comentario: null,
    };

    const valores = UpdateAvaliacaoProdutoFormSchema.parse(
      criarUpdateAvaliacaoProdutoFormDefaultValues(avaliacaoSemComentario),
    );

    const resultado = criarUpdateAvaliacaoProdutoBody(valores, {
      nota: true,
    });

    expect(resultado).toEqual({
      nota: 5,
    });
  });

  it("rejeita um payload sem campos alterados", () => {
    const valores = UpdateAvaliacaoProdutoFormSchema.parse(
      criarUpdateAvaliacaoProdutoFormDefaultValues(AVALIACAO),
    );

    expect(() => criarUpdateAvaliacaoProdutoBody(valores, {})).toThrow();
  });
});
