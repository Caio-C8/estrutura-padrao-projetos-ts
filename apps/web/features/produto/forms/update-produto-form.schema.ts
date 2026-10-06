import * as z from "zod";
import { UpdateProdutoSchema, type UpdateProdutoInput } from "@repo/contracts";
import { ProdutoFormFieldsSchema } from "./produto-form-fields.schema";

function normalizarTextoAnulavel(valor: string): string | null {
  const valorNormalizado = valor.trim();

  return valorNormalizado === "" ? null : valorNormalizado;
}

function normalizarDecimal(valor: string): string {
  return valor.trim().replace(",", ".");
}

function normalizarNumeroObrigatorio(valor: string): number {
  const valorNormalizado = normalizarDecimal(valor);

  return valorNormalizado === "" ? Number.NaN : Number(valorNormalizado);
}

function normalizarNumeroAnulavel(valor: string): number | null {
  const valorNormalizado = normalizarDecimal(valor);

  return valorNormalizado === "" ? null : Number(valorNormalizado);
}

function normalizarDataHoraLocal(valor: string): string | null {
  const valorNormalizado = valor.trim();

  if (valorNormalizado === "") {
    return null;
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

export const UpdateProdutoFormSchema = ProdutoFormFieldsSchema.transform(
  (valores): UpdateProdutoInput => ({
    sku: valores.sku,
    nome: valores.nome,
    descricao: normalizarTextoAnulavel(valores.descricao),
    urlManual: normalizarTextoAnulavel(valores.urlManual),
    status: valores.status,
    emDestaque: valores.emDestaque,
    estoque: normalizarNumeroObrigatorio(valores.estoque),
    preco: normalizarDecimal(valores.preco),
    pesoKg: normalizarNumeroAnulavel(valores.pesoKg),
    dataValidade: normalizarTextoAnulavel(valores.dataValidade),
    disponivelEm: normalizarDataHoraLocal(valores.disponivelEm),
  }),
).pipe(UpdateProdutoSchema);

export type UpdateProdutoFormInput = z.input<typeof UpdateProdutoFormSchema>;

export type UpdateProdutoFormData = z.output<typeof UpdateProdutoFormSchema>;
