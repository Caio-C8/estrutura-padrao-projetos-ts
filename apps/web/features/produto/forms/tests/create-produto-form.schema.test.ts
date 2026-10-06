import { describe, expect, it } from "vitest";
import { StatusProduto } from "@repo/contracts";
import {
  CREATE_PRODUTO_FORM_DEFAULT_VALUES,
  CreateProdutoFormSchema,
} from "../create-produto-form.schema";

describe("CreateProdutoFormSchema", () => {
  it("converte a representação visual para o contrato da API", () => {
    const dataHoraLocal = "2026-12-02T10:30";

    const resultado = CreateProdutoFormSchema.parse({
      ...CREATE_PRODUTO_FORM_DEFAULT_VALUES,
      sku: " produto-001 ",
      nome: " Notebook profissional ",
      descricao: " Equipamento para uso profissional. ",
      urlManual: " https://example.com/manual ",
      status: StatusProduto.ATIVO,
      emDestaque: false,
      estoque: "10",
      preco: "370,98",
      pesoKg: "1,5",
      dataValidade: "2029-10-01",
      disponivelEm: dataHoraLocal,
    });

    expect(resultado).toEqual({
      sku: "PRODUTO-001",
      nome: "Notebook profissional",
      descricao: "Equipamento para uso profissional.",
      urlManual: "https://example.com/manual",
      status: StatusProduto.ATIVO,
      emDestaque: false,
      estoque: 10,
      preco: "370.98",
      pesoKg: 1.5,
      dataValidade: "2029-10-01",
      disponivelEm: new Date(2026, 11, 2, 10, 30, 0, 0).toISOString(),
    });
  });

  it("omite campos opcionais deixados vazios", () => {
    const resultado = CreateProdutoFormSchema.parse({
      ...CREATE_PRODUTO_FORM_DEFAULT_VALUES,
      sku: "PRODUTO-001",
      nome: "Notebook profissional",
      preco: "370.98",
    });

    expect(resultado).toEqual({
      sku: "PRODUTO-001",
      nome: "Notebook profissional",
      status: StatusProduto.RASCUNHO,
      emDestaque: true,
      estoque: 0,
      preco: "370.98",
    });

    expect(resultado).not.toHaveProperty("descricao");
    expect(resultado).not.toHaveProperty("urlManual");
    expect(resultado).not.toHaveProperty("pesoKg");
    expect(resultado).not.toHaveProperty("dataValidade");
    expect(resultado).not.toHaveProperty("disponivelEm");
  });

  it("mantém os erros associados aos campos correspondentes", () => {
    const resultado = CreateProdutoFormSchema.safeParse({
      ...CREATE_PRODUTO_FORM_DEFAULT_VALUES,
      sku: "",
      nome: "",
      estoque: "",
      preco: "370.988",
      pesoKg: "0",
      urlManual: "manual-invalido",
      dataValidade: "01/10/2029",
      disponivelEm: "02/12/2026 10:30",
    });

    expect(resultado.success).toBe(false);

    if (resultado.success) {
      return;
    }

    const camposComErro = resultado.error.issues.map((issue) =>
      issue.path.map(String).join("."),
    );

    expect(camposComErro).toEqual(
      expect.arrayContaining([
        "sku",
        "nome",
        "estoque",
        "preco",
        "pesoKg",
        "urlManual",
        "dataValidade",
        "disponivelEm",
      ]),
    );
  });
});
