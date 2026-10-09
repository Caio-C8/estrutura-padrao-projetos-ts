import { describe, expect, it } from "vitest";
import { CreateAvaliacaoProdutoFormSchema } from "../create-avaliacao-produto-form.schema";

describe("CreateAvaliacaoProdutoFormSchema", () => {
  it("transforma os valores do formulário para o contrato", () => {
    const resultado = CreateAvaliacaoProdutoFormSchema.parse({
      autorNome: " Maria ",
      nota: "5",
      comentario: " Produto excelente. ",
      recomenda: true,
    });

    expect(resultado).toEqual({
      autorNome: "Maria",
      nota: 5,
      comentario: "Produto excelente.",
      recomenda: true,
    });
  });

  it("omite o comentário quando o campo está vazio", () => {
    const resultado = CreateAvaliacaoProdutoFormSchema.parse({
      autorNome: "Maria",
      nota: "4",
      comentario: "   ",
      recomenda: false,
    });

    expect(resultado).toEqual({
      autorNome: "Maria",
      nota: 4,
      recomenda: false,
    });
  });

  it("rejeita autor e nota obrigatórios ausentes", () => {
    const resultado = CreateAvaliacaoProdutoFormSchema.safeParse({
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
});
