import { describe, expect, it } from "vitest";
import { normalizarRotaObservavel } from "../routes";

describe("normalizarRotaObservavel", () => {
  it.each([
    ["/", "inicio"],
    ["/produtos", "produto.lista"],
    ["/produtos/", "produto.lista"],
    ["/produtos/novo", "produto.criacao"],
    ["/produtos/produto-123", "produto.detalhe"],
    ["/produtos/produto-123/editar", "produto.edicao"],
    ["/produtos/produto-123/avaliacoes", "avaliacao.lista"],
    ["/produtos/produto-123/avaliacoes/nova", "avaliacao.criacao"],
    ["/produtos/produto-123/avaliacoes/avaliacao-456", "avaliacao.detalhe"],
    [
      "/produtos/produto-123/avaliacoes/avaliacao-456/editar",
      "avaliacao.edicao",
    ],
  ])("normaliza %s como %s", (pathname, nomeEsperado) => {
    expect(normalizarRotaObservavel(pathname)).toBe(nomeEsperado);
  });

  it("não devolve identificadores presentes no pathname", () => {
    const nome = normalizarRotaObservavel(
      "/produtos/a220b745-91b3-4674-80d6-6b72c3867117/avaliacoes/" +
        "8869f632-eabd-419d-b460-7fa31e5a1bfa",
    );

    expect(nome).toBe("avaliacao.detalhe");
    expect(nome).not.toContain("a220b745");
    expect(nome).not.toContain("8869f632");
  });

  it("usa uma categoria segura para rotas não mapeadas", () => {
    expect(normalizarRotaObservavel("/area-desconhecida/segredo")).toBe(
      "rota.desconhecida",
    );
  });
});
