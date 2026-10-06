import * as z from "zod";
import {
  CreateProdutoSchema,
  StatusProduto,
  type CreateProdutoInput,
} from "@repo/contracts";
import { ProdutoFormFieldsSchema } from "./produto-form-fields.schema";

function normalizarTextoOpcional(valor: string): string | undefined {
  const valorNormalizado = valor.trim();

  return valorNormalizado === "" ? undefined : valorNormalizado;
}

function normalizarDecimal(valor: string): string {
  return valor.trim().replace(",", ".");
}

function normalizarNumeroObrigatorio(valor: string): number {
  const valorNormalizado = normalizarDecimal(valor);

  return valorNormalizado === "" ? Number.NaN : Number(valorNormalizado);
}

function normalizarNumeroOpcional(valor: string): number | undefined {
  const valorNormalizado = normalizarDecimal(valor);

  return valorNormalizado === "" ? undefined : Number(valorNormalizado);
}

function normalizarDataHoraLocal(valor: string): string | undefined {
  const valorNormalizado = valor.trim();

  if (valorNormalizado === "") {
    return undefined;
  }

  const resultado = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(
    valorNormalizado,
  );

  if (!resultado) {
    return valorNormalizado;
  }

  const [, anoTexto, mesTexto, diaTexto, horaTexto, minutoTexto] = resultado;

  const ano = Number(anoTexto);
  const mes = Number(mesTexto);
  const dia = Number(diaTexto);
  const hora = Number(horaTexto);
  const minuto = Number(minutoTexto);

  const dataLocal = new Date(ano, mes - 1, dia, hora, minuto, 0, 0);

  const dataValida =
    dataLocal.getFullYear() === ano &&
    dataLocal.getMonth() === mes - 1 &&
    dataLocal.getDate() === dia &&
    dataLocal.getHours() === hora &&
    dataLocal.getMinutes() === minuto;

  if (!dataValida) {
    return valorNormalizado;
  }

  return dataLocal.toISOString();
}

export const CreateProdutoFormSchema = ProdutoFormFieldsSchema.transform(
  (valores): CreateProdutoInput => {
    const descricao = normalizarTextoOpcional(valores.descricao);

    const urlManual = normalizarTextoOpcional(valores.urlManual);

    const pesoKg = normalizarNumeroOpcional(valores.pesoKg);

    const dataValidade = normalizarTextoOpcional(valores.dataValidade);

    const disponivelEm = normalizarDataHoraLocal(valores.disponivelEm);

    return {
      sku: valores.sku,
      nome: valores.nome,
      status: valores.status,
      emDestaque: valores.emDestaque,
      estoque: normalizarNumeroObrigatorio(valores.estoque),
      preco: normalizarDecimal(valores.preco),

      ...(descricao === undefined ? {} : { descricao }),
      ...(urlManual === undefined ? {} : { urlManual }),
      ...(pesoKg === undefined ? {} : { pesoKg }),
      ...(dataValidade === undefined ? {} : { dataValidade }),
      ...(disponivelEm === undefined ? {} : { disponivelEm }),
    };
  },
).pipe(CreateProdutoSchema);

export type CreateProdutoFormInput = z.input<typeof CreateProdutoFormSchema>;

export type CreateProdutoFormData = z.output<typeof CreateProdutoFormSchema>;

export const CREATE_PRODUTO_FORM_DEFAULT_VALUES = {
  sku: "",
  nome: "",
  descricao: "",
  urlManual: "",
  status: StatusProduto.RASCUNHO,
  emDestaque: true,
  estoque: "0",
  preco: "",
  pesoKg: "",
  dataValidade: "",
  disponivelEm: "",
} satisfies CreateProdutoFormInput;
