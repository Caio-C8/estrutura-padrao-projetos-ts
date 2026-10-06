import { describe, expect, it } from "vitest";
import { StatusProduto, type ProdutoDetalhadoResponse } from "@repo/contracts";
import {
  criarUpdateProdutoBody,
  criarUpdateProdutoFormDefaultValues,
} from "../update-produto-form.mapper";
import { UpdateProdutoFormSchema } from "../update-produto-form.schema";

const PRODUTO = {
  id: "b5c5f7e3-4c5f-4f61-9c67-f9da7a2584e4",
  sku: "PRODUTO-001",
  nome: "Notebook profissional",
  descricao: "Produto para uso profissional.",
  urlManual: "https://example.com/manual",
  status: StatusProduto.ATIVO,
  emDestaque: true,
  estoque: 10,
  preco: "370.98",
  pesoKg: 1.235,
  quantidadeVendas: "0",
  dataValidade: "2029-10-01",
  disponivelEm: "2026-12-02T13:30:00.000Z",
  createdAt: "2026-10-06T10:00:00.000Z",
  updatedAt: "2026-10-06T10:00:00.000Z",
} satisfies ProdutoDetalhadoResponse;

function formatarDataHoraLocalEsperada(valor: string): string {
  const data = new Date(valor);

  const preencher = (numero: number, tamanho = 2) =>
    String(numero).padStart(tamanho, "0");

  return [
    preencher(data.getFullYear(), 4),
    "-",
    preencher(data.getMonth() + 1),
    "-",
    preencher(data.getDate()),
    "T",
    preencher(data.getHours()),
    ":",
    preencher(data.getMinutes()),
  ].join("");
}

describe("criarUpdateProdutoFormDefaultValues", () => {
  it("converte o detalhe para os valores dos controles HTML", () => {
    const resultado = criarUpdateProdutoFormDefaultValues(PRODUTO);

    expect(resultado).toEqual({
      sku: "PRODUTO-001",
      nome: "Notebook profissional",
      descricao: "Produto para uso profissional.",
      urlManual: "https://example.com/manual",
      status: StatusProduto.ATIVO,
      emDestaque: true,
      estoque: "10",
      preco: "370.98",
      pesoKg: "1.24",
      dataValidade: "2029-10-01",
      disponivelEm: formatarDataHoraLocalEsperada(PRODUTO.disponivelEm!),
    });
  });

  it("converte valores anuláveis para controles vazios", () => {
    const resultado = criarUpdateProdutoFormDefaultValues({
      ...PRODUTO,
      descricao: null,
      urlManual: null,
      pesoKg: null,
      dataValidade: null,
      disponivelEm: null,
    });

    expect(resultado).toMatchObject({
      descricao: "",
      urlManual: "",
      pesoKg: "",
      dataValidade: "",
      disponivelEm: "",
    });
  });
});

describe("criarUpdateProdutoBody", () => {
  it("inclui somente os campos marcados como alterados", () => {
    const valores = UpdateProdutoFormSchema.parse({
      ...criarUpdateProdutoFormDefaultValues(PRODUTO),
      nome: "Notebook atualizado",
      estoque: "15",
    });

    const resultado = criarUpdateProdutoBody(valores, {
      nome: true,
      estoque: true,
    });

    expect(resultado).toEqual({
      nome: "Notebook atualizado",
      estoque: 15,
    });
  });

  it("envia null quando um campo anulável é apagado", () => {
    const valores = UpdateProdutoFormSchema.parse({
      ...criarUpdateProdutoFormDefaultValues(PRODUTO),
      descricao: "",
      pesoKg: "",
    });

    const resultado = criarUpdateProdutoBody(valores, {
      descricao: true,
      pesoKg: true,
    });

    expect(resultado).toEqual({
      descricao: null,
      pesoKg: null,
    });
  });

  it("rejeita um payload sem campos alterados", () => {
    const valores = UpdateProdutoFormSchema.parse(
      criarUpdateProdutoFormDefaultValues(PRODUTO),
    );

    expect(() => criarUpdateProdutoBody(valores, {})).toThrow();
  });
});
