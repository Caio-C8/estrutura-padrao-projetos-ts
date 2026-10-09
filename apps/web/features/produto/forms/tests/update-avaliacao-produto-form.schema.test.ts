import { describe, expect, it } from "vitest";
import { UpdateAvaliacaoProdutoFormSchema } from "../update-avaliacao-produto-form.schema";

describe("UpdateAvaliacaoProdutoFormSchema", () => {
  it("transforma os valores visuais para o contrato de atualização", () => {
    const resultado = UpdateAvaliacaoProdutoFormSchema.parse({
      autorNome: " Maria atualizada ",
      nota: "4",
      comentario: " Comentário atualizado. ",
      recomenda: false,
    });

    expect(resultado).toEqual({
      autorNome: "Maria atualizada",
      nota: 4,
      comentario: "Comentário atualizado.",
      recomenda: false,
    });
  });

  it("transforma comentário vazio em null", () => {
    const resultado = UpdateAvaliacaoProdutoFormSchema.parse({
      autorNome: "Maria",
      nota: "5",
      comentario: "   ",
      recomenda: true,
    });

    expect(resultado).toEqual({
      autorNome: "Maria",
      nota: 5,
      comentario: null,
      recomenda: true,
    });
  });

  it("rejeita autor e nota obrigatórios ausentes", () => {
    const resultado = UpdateAvaliacaoProdutoFormSchema.safeParse({
      autorNome: "",
      nota: "",
      comentario: "",
      recomenda: true,
    });

    expect(resultado.success).toBe(false);

    if (resultado.success) {
      return;
    }

    expect(resultado.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["autorNome"],
          message: "O nome do autor é obrigatório.",
        }),
        expect.objectContaining({
          path: ["nota"],
          message: "Selecione uma nota entre 1 e 5.",
        }),
      ]),
    );
  });

  it("rejeita uma nota fora do intervalo permitido", () => {
    const resultado = UpdateAvaliacaoProdutoFormSchema.safeParse({
      autorNome: "Maria",
      nota: "6",
      comentario: "",
      recomenda: true,
    });

    expect(resultado.success).toBe(false);

    if (resultado.success) {
      return;
    }

    expect(resultado.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ["nota"],
          message: "Selecione uma nota entre 1 e 5.",
        }),
      ]),
    );
  });
});
